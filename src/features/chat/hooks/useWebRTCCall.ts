'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '@/lib/socket';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
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

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());
  const originalCameraTrackRef = useRef<MediaStreamTrack | null>(null);
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
          const isLive = videoTracks.some((t) => t.readyState === 'live' && !t.muted);
          setHasRemoteVideo(isLive);
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
      const pc = peerConnectionRef.current;
      if (!pc || !data.candidate) return;

      if (pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.warn('ICE candidate addition failed:', e);
        }
      } else {
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

  // 5. Bidirectional Screen Sharing (Works for both Caller and Callee simultaneously)
  const toggleScreenShare = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    const videoTransceiver = pc
      .getTransceivers()
      .find((t) => t.receiver.track.kind === 'video');
    if (!videoTransceiver) return;

    if (isScreenSharing) {
      const camTrack = !isVideoDisabled ? originalCameraTrackRef.current : null;
      await videoTransceiver.sender.replaceTrack(camTrack);

      if (localStreamRef.current) {
        const extraVideos = localStreamRef.current
          .getVideoTracks()
          .filter((t) => t !== originalCameraTrackRef.current);
        extraVideos.forEach((t) => t.stop());

        const audioTracks = localStreamRef.current.getAudioTracks();
        const nextTracks = camTrack ? [...audioTracks, camTrack] : audioTracks;
        const updatedStream = new MediaStream(nextTracks);
        localStreamRef.current = updatedStream;
        setLocalStream(updatedStream);
      }

      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        const screenTrack = screenStream.getVideoTracks()[0];

        // Attach onended handler before passing track into state
        screenTrack.onended = async () => {
          const cam = !isVideoDisabled ? originalCameraTrackRef.current : null;
          if (peerConnectionRef.current) {
            const vTrans = peerConnectionRef.current
              .getTransceivers()
              .find((t) => t.receiver.track.kind === 'video');
            if (vTrans) {
              await vTrans.sender.replaceTrack(cam);
            }
          }

          const audioTracks = localStreamRef.current
            ? localStreamRef.current.getAudioTracks()
            : [];
          const nextTracks = cam ? [...audioTracks, cam] : audioTracks;
          const revertedStream = new MediaStream(nextTracks);
          localStreamRef.current = revertedStream;
          setLocalStream(revertedStream);
          setIsScreenSharing(false);
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
        // Ignore user cancelling the browser screen picker dialog
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
          return;
        }
        console.warn('Screen share error:', err);
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
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  };
}