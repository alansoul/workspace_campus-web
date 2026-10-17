'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  Video,
  Hash,
  Send,
  Loader2,
  User,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Download,
  X,
} from 'lucide-react';
import { Channel, ChatMessage } from '../types/chat.types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://workspace-campus-api.onrender.com';

interface ChatFeedProps {
  currentChannel: Channel | null;
  messages: ChatMessage[];
  isLoadingMessages: boolean;
  currentUserId?: string;
  currentUserName?: string;
  onSendMessage: (
    content: string,
    attachment?: {
      fileUrl?: string;
      fileType?: string;
      fileName?: string;
      fileSize?: number;
    },
  ) => void;
  onUploadFile: (file: File) => Promise<{
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }>;
  onStartCall: (isVideo: boolean) => void;
  getInitials: (name?: string) => string;
}

export function ChatFeed({
  currentChannel,
  messages,
  isLoadingMessages,
  currentUserId,
  currentUserName,
  onSendMessage,
  onUploadFile,
  onStartCall,
  getInitials,
}: ChatFeedProps) {
  const [inputText, setInputText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<{
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [acceptedMimeTypes, setAcceptedMimeTypes] = useState('*/*');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingFile]);

  const openFilePicker = (mime: string) => {
    setAcceptedMimeTypes(mime);
    setMenuOpen(false);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploaded = await onUploadFile(file);
      setPendingFile(uploaded);
    } catch (err) {
      console.error('File upload failed:', err);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !pendingFile) return;

    onSendMessage(inputText, pendingFile || undefined);
    setInputText('');
    setPendingFile(null);
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isDirect = currentChannel?.isDirect;
  const friendName = currentChannel?.friend?.name || 'Campus Friend';
  const friendEmail = currentChannel?.friend?.email;

  return (
    <main className="flex flex-1 flex-col bg-[#111420] relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedMimeTypes}
        className="hidden"
      />

      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-[#181e2e] px-6 bg-[#0f131f]/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-tr from-[#6366f1] via-[#7c4dff] to-[#ec4899] shadow-md">
            {isDirect ? <User className="h-5 w-5 text-white" /> : <Sparkles className="h-5 w-5 text-white" />}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">
              {isDirect ? friendName : `#${currentChannel?.name || 'hub'}`}
            </h2>
            <p className="text-[11px] text-[#6f7792]">
              {isDirect ? friendEmail || 'End-to-end direct peer message' : currentChannel?.description || 'Campus discussion'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onStartCall(false)}
            title="Audio Call"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#181d2c] text-[#8e96af] hover:text-white transition"
          >
            <Volume2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onStartCall(true)}
            title="Video Call"
            className="flex items-center gap-1.5 rounded-xl bg-linear-to-r from-[#4f46e5] to-[#7c4dff] px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition"
          >
            <Video className="h-3.5 w-3.5" />
            <span>Call</span>
          </button>
        </div>
      </header>

      {/* Message Feed Area */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin">
        {isLoadingMessages ? (
          <div className="flex h-full items-center justify-center text-xs text-[#6f7792]">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#181d2c] text-indigo-400">
              {isDirect ? <User className="h-7 w-7" /> : <Hash className="h-7 w-7" />}
            </div>
            <h3 className="mt-3 text-base font-bold text-white">
              {isDirect ? `Start chatting with ${friendName}` : `Welcome to #${currentChannel?.name}!`}
            </h3>
            <p className="mt-1 text-xs text-[#6f7792] max-w-sm">
              Send messages, documents, or photos to get started.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe =
              Boolean(currentUserId && msg.senderId === currentUserId) ||
              Boolean(currentUserName && msg.senderName === currentUserName);

            const fileFullUrl = msg.fileUrl?.startsWith('http')
              ? msg.fileUrl
              : `${API_URL}${msg.fileUrl}`;

            return (
              <div
                key={msg.id}
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start items-start gap-3'}`}
              >
                {!isMe && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-linear-to-tr from-indigo-600 to-purple-600 font-bold text-white text-[11px] shadow-sm">
                    {getInitials(msg.senderName)}
                  </div>
                )}

                <div className={`max-w-[80%] sm:max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <div className="flex items-baseline gap-2 mb-1 px-1">
                      <span className="text-xs font-semibold text-white">{msg.senderName}</span>
                      <span className="text-[10px] text-[#5d6580]">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  <div
                    className={`p-3 text-xs leading-relaxed wrap-break-word shadow-md ${
                      isMe
                        ? 'bg-linear-to-r from-[#5845eb] to-[#7c4dff] text-white rounded-2xl rounded-tr-xs'
                        : 'bg-[#181d2e] border border-[#232b40] text-[#d2d7e5] rounded-2xl rounded-tl-xs'
                    }`}
                  >
                    {/* Image Attachment Preview */}
                    {msg.fileType === 'IMAGE' && msg.fileUrl && (
                      <div className="mb-2 overflow-hidden rounded-xl bg-black/40 border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={fileFullUrl}
                          alt={msg.fileName || 'Photo'}
                          className="max-h-72 w-auto object-cover cursor-pointer hover:opacity-95 transition"
                          onClick={() => window.open(fileFullUrl, '_blank')}
                        />
                      </div>
                    )}

                    {/* PDF & Document Attachment Card */}
                    {(msg.fileType === 'PDF' || msg.fileType === 'DOCUMENT') && msg.fileUrl && (
                      <div className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-black/25 border border-white/10 p-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              msg.fileType === 'PDF' ? 'bg-rose-500' : 'bg-indigo-500'
                            } text-white`}
                          >
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate text-xs">{msg.fileName || 'Attachment'}</p>
                            <p className="text-[10px] text-white/70">
                              {formatFileSize(msg.fileSize)} • {msg.fileType}
                            </p>
                          </div>
                        </div>

                        <a
                          href={fileFullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={msg.fileName || 'document'}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    )}

                    {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}

                    <span className={`block text-right text-[9px] mt-1 ${isMe ? 'text-indigo-200/80' : 'text-[#7e869e]'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Pending Attachment Preview Bar */}
      {pendingFile && (
        <div className="mx-4 mb-2 flex items-center justify-between rounded-xl bg-[#1d2235] border border-indigo-500/40 p-2.5 shadow-lg">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white shrink-0">
              {pendingFile.fileType === 'IMAGE' ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            </div>
            <div className="min-w-0 truncate">
              <span className="text-xs font-semibold text-white truncate block">{pendingFile.fileName}</span>
              <span className="text-[10px] text-indigo-300">{formatFileSize(pendingFile.fileSize)}</span>
            </div>
          </div>
          <button onClick={() => setPendingFile(null)} className="rounded p-1 text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* WhatsApp-Style Attachment Menu Popup */}
      {menuOpen && (
        <div className="absolute bottom-20 left-4 z-50 flex w-56 flex-col gap-1 rounded-2xl border border-[#2b334d] bg-[#161a29] p-2 shadow-2xl backdrop-blur-md animate-fadeIn">
          <button
            type="button"
            onClick={() => openFilePicker('application/pdf,.doc,.docx,.txt')}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-white hover:bg-[#23293e] transition"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7c4dff] text-white">
              <FileText className="h-4 w-4" />
            </div>
            <span>Document / PDF</span>
          </button>

          <button
            type="button"
            onClick={() => openFilePicker('image/*')}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-white hover:bg-[#23293e] transition"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00a884] text-white">
              <ImageIcon className="h-4 w-4" />
            </div>
            <span>Photos & videos</span>
          </button>
        </div>
      )}

      {/* Message Composer Bar */}
      <div className="p-4 bg-[#0f131f] border-t border-[#181e2e]">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-2xl bg-[#171c2b] border border-[#232a40] px-3.5 py-2 focus-within:border-indigo-500 transition relative"
        >
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
              menuOpen ? 'bg-indigo-600 text-white' : 'text-[#8e96af] hover:text-white hover:bg-[#22293d]'
            }`}
            title="Attach Document or Image"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-indigo-400" /> : <Paperclip className="h-4 w-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              pendingFile
                ? 'Add a caption...'
                : isDirect
                  ? `Message ${friendName}...`
                  : `Message #${currentChannel?.name || 'general'}`
            }
            className="flex-1 bg-transparent text-xs text-white placeholder-[#58617d] focus:outline-none"
          />

          <button
            type="submit"
            disabled={(!inputText.trim() && !pendingFile) || isUploading}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-tr from-[#6366f1] to-[#7c4dff] text-white shadow-md shadow-indigo-500/25 disabled:opacity-40 transition"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </main>
  );
}