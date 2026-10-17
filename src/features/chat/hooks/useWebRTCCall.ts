'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '@/lib/socket';

// campus-web/src/features/chat/hooks/useWebRTCCall.ts
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    // 1. Google Public STUN (For open / residential networks)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },

    // 2. OpenRelay Production TURN Server (Bypasses University Firewalls & Symmetric NAT)
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp',
        'turns:openrelay.metered.ca:443?transport=tcp',
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
};

export interface IncomingCallData {
  fromSocketId: string;
  channelId: string;
  offer: RTCSessionDescriptionInit;
  callerName: string;
  callerId: string;
  isVideo: boolean;
}

export interface ActiveCallData {
  channelId: string;
  peerName: string;
  isVideo: boolean;
}

export function useWebRTCCall(currentUser?: { id?: string; fullName?: string; email?: string }) {
  const [callState, setCallState] = useState<'idle' | 'calling' | 'incoming' | 'connected'>('idle');
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCallData | null>(null);

  // Reactive streams for reliable video element binding
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  // 🔄 Camera facing mode: 'user' (front) or 'environment' (back/rear)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());
  const originalCameraTrackRef = useRef<MediaStreamTrack | null>(null);
  const activeScreenTrackRef = useRef<MediaStreamTrack | null>(null);
  const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);

  // Cleanup all media tracks and active peer connection
  const cleanupCall = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (activeScreenTrackRef.current) {
      activeScreenTrackRef.current.stop();
      activeScreenTrackRef.current = null;
    }

    remoteStreamRef.current.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current = new MediaStream();

    setLocalStream(null);
    setRemoteStream(null);
    setHasRemoteVideo(false);

    originalCameraTrackRef.current = null;
    iceCandidatesQueue.current = [];

    setCallState('idle');
    setIncomingCall(null);
    setActiveCall(null);
    setIsAudioMuted(false);
    setIsVideoDisabled(false);
    setIsScreenSharing(false);
  }, []);

  const endCall = useCallback(() => {
    if (activeCall) {
      const socket = getSocket();
      socket.emit('call:end', { channelId: activeCall.channelId });
    }
    cleanupCall();
  }, [activeCall, cleanupCall]);

  const rejectCall = useCallback(() => {
    if (incomingCall) {
      const socket = getSocket();
      socket.emit('call:reject', { channelId: incomingCall.channelId });
    }
    cleanupCall();
  }, [incomingCall, cleanupCall]);

  // Create PeerConnection instance with persistent stream reference
  const createPeerConnection = useCallback(
    (channelId: string) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;
      remoteStreamRef.current = new MediaStream();
      setRemoteStream(remoteStreamRef.current);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const socket = getSocket();
          socket.emit('call:ice-candidate', {
            channelId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      pc.ontrack = (event) => {
        const track = event.track;
        remoteStreamRef.current.addTrack(track);

        const updateRemoteVideoStatus = () => {
          const videoTracks = remoteStreamRef.current.getVideoTracks();
          const hasLiveVideo = videoTracks.some((t) => t.readyState === 'live');
          setHasRemoteVideo(hasLiveVideo);

          // Force React state update with a fresh MediaStream instance so the <video> element re-renders
          setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()));
        };

        updateRemoteVideoStatus();
        track.onunmute = updateRemoteVideoStatus;
        track.onmute = updateRemoteVideoStatus;
        track.onended = () => {
          remoteStreamRef.current.removeTrack(track);
          updateRemoteVideoStatus();
        };

        setCallState('connected');
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setCallState('connected');
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          cleanupCall();
        }
      };

      return pc;
    },
    [cleanupCall],
  );

  // 1. Start Call (Caller)
  const startCall = useCallback(
    async (channelId: string, peerName: string, isVideo: boolean) => {
      try {
        setCallState('calling');
        setActiveCall({ channelId, peerName, isVideo });

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: isVideo ? { width: 1280, height: 720 } : false,
          });
        } catch {
          // Fallback to audio only if camera is unavailable
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        }

        localStreamRef.current = stream;
        setLocalStream(stream);

        if (stream.getVideoTracks().length > 0) {
          originalCameraTrackRef.current = stream.getVideoTracks()[0];
        } else {
          setIsVideoDisabled(true);
        }

        const pc = createPeerConnection(channelId);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Always reserve a bidirectional video transceiver so either side can share screen/video anytime
        const hasVideoSender = pc.getSenders().some((s) => s.track?.kind === 'video');
        if (!hasVideoSender) {
          pc.addTransceiver('video', { direction: 'sendrecv' });
        }

        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);

        const socket = getSocket();
        socket.emit('call:offer', {
          channelId,
          offer,
          callerName: currentUser?.fullName || currentUser?.email?.split('@')[0] || 'Peer',
          callerId: currentUser?.id || 'anonymous',
          isVideo,
        });
      } catch (err) {
        console.error('Call initialization failed:', err);
        cleanupCall();
      }
    },
    [currentUser, createPeerConnection, cleanupCall],
  );

  // 2. Accept Call (Callee)
  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      const { channelId, offer, callerName, isVideo } = incomingCall;
      setActiveCall({ channelId, peerName: callerName, isVideo });

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: isVideo ? { width: 1280, height: 720 } : false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      }

      localStreamRef.current = stream;
      setLocalStream(stream);

      if (stream.getVideoTracks().length > 0) {
        originalCameraTrackRef.current = stream.getVideoTracks()[0];
      } else {
        setIsVideoDisabled(true);
      }

      const pc = createPeerConnection(channelId);

      // 1. Set Remote Description FIRST so transceivers pair with caller's offer
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // 2. Attach local audio and video tracks to the paired transceivers
      const audioTrack = stream.getAudioTracks()[0];
      const videoTrack = stream.getVideoTracks()[0] || null;

      const audioTransceiver = pc
        .getTransceivers()
        .find((t) => t.receiver.track.kind === 'audio');
      if (audioTransceiver && audioTrack) {
        await audioTransceiver.sender.replaceTrack(audioTrack);
        audioTransceiver.direction = 'sendrecv';
      } else if (audioTrack) {
        pc.addTrack(audioTrack, stream);
      }

      const videoTransceiver = pc
        .getTransceivers()
        .find((t) => t.receiver.track.kind === 'video');
      if (videoTransceiver) {
        if (videoTrack) {
          await videoTransceiver.sender.replaceTrack(videoTrack);
        }
        // Enable sendrecv so Callee can also send video & screen share
        videoTransceiver.direction = 'sendrecv';
      } else if (videoTrack) {
        pc.addTrack(videoTrack, stream);
      }

      // 3. Flush queued ICE candidates
      while (iceCandidatesQueue.current.length > 0) {
        const candidate = iceCandidatesQueue.current.shift();
        if (candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const socket = getSocket();
      socket.emit('call:answer', { channelId, answer });

      setCallState('connected');
      setIncomingCall(null);
    } catch (err) {
      console.error('Failed to accept call:', err);
      cleanupCall();
    }
  }, [incomingCall, createPeerConnection, cleanupCall]);

  // 3. Socket Event Bindings
  useEffect(() => {
    const socket = getSocket();

    const handleIncoming = (data: IncomingCallData) => {
      if (data.callerId === currentUser?.id) return;
      setIncomingCall(data);
      setCallState('incoming');
    };

    const handleAnswered = async (data: { answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      if (pc.signalingState === 'have-local-offer') {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));

          while (iceCandidatesQueue.current.length > 0) {
            const candidate = iceCandidatesQueue.current.shift();
            if (candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
          }
          setCallState('connected');
        } catch (err) {
          console.error('Error applying remote answer:', err);
        }
      }
    };

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
      if (!data.candidate) return;
      const pc = peerConnectionRef.current;

      // If peer connection and remote offer are ready, apply candidate immediately
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.warn('ICE candidate addition failed:', e);
        }
      } else {
        // Buffer candidate while phone is ringing or offer is resolving
        iceCandidatesQueue.current.push(data.candidate);
      }
    };

    const handleEnded = () => cleanupCall();
    const handleRejected = () => {
      alert('Call was declined.');
      cleanupCall();
    };

    socket.on('call:incoming', handleIncoming);
    socket.on('call:answered', handleAnswered);
    socket.on('call:ice-candidate', handleIceCandidate);
    socket.on('call:ended', handleEnded);
    socket.on('call:rejected', handleRejected);

    return () => {
      socket.off('call:incoming', handleIncoming);
      socket.off('call:answered', handleAnswered);
      socket.off('call:ice-candidate', handleIceCandidate);
      socket.off('call:ended', handleEnded);
      socket.off('call:rejected', handleRejected);
    };
  }, [currentUser, cleanupCall]);

  // 4. In-Call Media Controls
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    const videoTransceiver = pc
      .getTransceivers()
      .find((t) => t.receiver.track.kind === 'video');
    if (!videoTransceiver) return;

    if (!isVideoDisabled) {
      await videoTransceiver.sender.replaceTrack(null);
      if (localStreamRef.current) {
        const audioTracks = localStreamRef.current.getAudioTracks();
        const updatedStream = new MediaStream(audioTracks);
        localStreamRef.current = updatedStream;
        setLocalStream(updatedStream);
      }
      setIsVideoDisabled(true);
    } else {
      try {
        let camTrack = originalCameraTrackRef.current;
        if (!camTrack || camTrack.readyState === 'ended') {
          const camStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: false,
          });
          camTrack = camStream.getVideoTracks()[0];
          originalCameraTrackRef.current = camTrack;
        }

        await videoTransceiver.sender.replaceTrack(camTrack);

        const audioTracks = localStreamRef.current
          ? localStreamRef.current.getAudioTracks()
          : [];
        const updatedStream = new MediaStream([...audioTracks, camTrack]);
        localStreamRef.current = updatedStream;
        setLocalStream(updatedStream);
        setIsVideoDisabled(false);
      } catch (err) {
        console.warn('Could not enable camera:', err);
      }
    }
  }, [isVideoDisabled]);

  // 🔄 Mobile Front / Back Camera Switch (also cycles webcams on PC)
  const switchCamera = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc || isScreenSharing) return;

    const videoTransceiver = pc
      .getTransceivers()
      .find((t) => t.receiver.track.kind === 'video');
    if (!videoTransceiver) return;

    const nextFacingMode = facingMode === 'user' ? 'environment' : 'user';

    try {
      // 1. Stop current camera track before opening the other sensor
      if (originalCameraTrackRef.current) {
        originalCameraTrackRef.current.stop();
      }

      // 2. Request next sensor (fallback if device lacks strict environment constraint)
      let newStream: MediaStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: nextFacingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: nextFacingMode },
          audio: false,
        });
      }

      const newTrack = newStream.getVideoTracks()[0];
      if (!newTrack) return;

      originalCameraTrackRef.current = newTrack;
      setFacingMode(nextFacingMode);

      // 3. Swap track on the active WebRTC peer connection
      await videoTransceiver.sender.replaceTrack(newTrack);

      // 4. Update local stream state for immediate UI feedback
      const audioTracks = localStreamRef.current
        ? localStreamRef.current.getAudioTracks()
        : [];
      const updatedStream = new MediaStream([...audioTracks, newTrack]);
      localStreamRef.current = updatedStream;
      setLocalStream(updatedStream);
      setIsVideoDisabled(false);
    } catch (err) {
      console.warn('Failed to switch camera source:', err);
    }
  }, [facingMode, isScreenSharing]);

  // 5. Screen Sharing (With AbortError Timeout Handling)
  const toggleScreenShare = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    const videoTransceiver = pc
      .getTransceivers()
      .find((t) => t.receiver.track.kind === 'video');
    if (!videoTransceiver) return;

    const revertToCamera = async () => {
      if (activeScreenTrackRef.current) {
        activeScreenTrackRef.current.stop();
        activeScreenTrackRef.current = null;
      }

      const camTrack = !isVideoDisabled ? originalCameraTrackRef.current : null;
      await videoTransceiver.sender.replaceTrack(camTrack);

      if (localStreamRef.current) {
        const audioTracks = localStreamRef.current.getAudioTracks();
        const nextTracks = camTrack ? [...audioTracks, camTrack] : audioTracks;
        const revertedStream = new MediaStream(nextTracks);
        localStreamRef.current = revertedStream;
        setLocalStream(revertedStream);
      }

      setIsScreenSharing(false);
    };

    if (isScreenSharing) {
      await revertToCamera();
    } else {
      try {
        if (activeScreenTrackRef.current) {
          activeScreenTrackRef.current.stop();
          activeScreenTrackRef.current = null;
        }

        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

        const screenTrack = screenStream.getVideoTracks()[0];
        if (!screenTrack) return;

        activeScreenTrackRef.current = screenTrack;

        // Auto-revert when user clicks browser's native "Stop sharing" bar
        screenTrack.onended = () => {
          void revertToCamera();
        };

        await videoTransceiver.sender.replaceTrack(screenTrack);
        videoTransceiver.direction = 'sendrecv';

        const audioTracks = localStreamRef.current
          ? localStreamRef.current.getAudioTracks()
          : [];
        const updatedStream = new MediaStream([...audioTracks, screenTrack]);
        localStreamRef.current = updatedStream;
        setLocalStream(updatedStream);

        setIsScreenSharing(true);
      } catch (err: unknown) {
        // Gracefully ignore cancel or browser capture timeout aborts
        if (
          err instanceof DOMException &&
          (err.name === 'NotAllowedError' || err.name === 'AbortError')
        ) {
          setIsScreenSharing(false);
          return;
        }
        console.warn('Screen share error:', err);
        setIsScreenSharing(false);
      }
    }
  }, [isScreenSharing, isVideoDisabled]);

  return {
    callState,
    incomingCall,
    activeCall,
    localStream,
    remoteStream,
    hasRemoteVideo,
    isAudioMuted,
    isVideoDisabled,
    isScreenSharing,
    facingMode,
    switchCamera,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  };
}