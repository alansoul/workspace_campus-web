
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
  Moon,
  Sun,
  Check,
} from 'lucide-react';
import { Channel, ChatMessage } from '../types/chat.types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://workspace-campus-api.onrender.com';

type ChatTheme = 'light' | 'dark';

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
  theme: ChatTheme;
  onToggleTheme: () => void;
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
  theme,
  onToggleTheme,
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [acceptedMimeTypes, setAcceptedMimeTypes] = useState('*/*');

  const isDirect = currentChannel?.isDirect;
  const friendName = currentChannel?.friend?.name || 'Campus Friend';
  const friendEmail = currentChannel?.friend?.email;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingFile]);

  const openFilePicker = (mime: string) => {
    setAcceptedMimeTypes(mime);
    setMenuOpen(false);

    // Wait for the browser to apply the updated accept filter.
    window.setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploaded = await onUploadFile(file);
      setPendingFile(uploaded);
    } catch (error) {
      console.error('File upload failed:', error);
      window.alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);

      // Allows the same file to be selected again.
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if ((!inputText.trim() && !pendingFile) || isUploading) return;

    onSendMessage(inputText, pendingFile || undefined);
    setInputText('');
    setPendingFile(null);
    setMenuOpen(false);
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes || bytes < 0) return '';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  
const getFileUrl = (fileUrl?: string | null): string => {
  if (!fileUrl) return '';

  // Keep absolute URLs unchanged.
  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  // Join relative file paths to the API URL without duplicate slashes.
  return `${API_URL.replace(/\/$/, '')}/${fileUrl.replace(/^\//, '')}`;
};


  const isDark = theme === 'dark';

  const mutedText = 'text-slate-500 dark:text-slate-400';

  return (
    <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-linear-to-br from-blue-50 via-white to-violet-50 text-slate-800 transition-colors duration-200 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 dark:text-slate-100">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedMimeTypes}
        className="hidden"
        aria-label="Choose attachment"
      />

      {/* Conversation header */}
      <header className="relative z-10 flex min-h-17 shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/80 px-3 backdrop-blur-xl sm:px-5 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/20">
            {isDirect ? (
              <User className="h-5 w-5" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              {isDirect
                ? friendName
                : `#${currentChannel?.name || 'hub'}`}
            </h2>

            <p className={`mt-0.5 truncate text-[11px] ${mutedText}`}>
              {isDirect
                ? friendEmail || 'Direct message'
                : currentChannel?.description || 'Campus discussion'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onStartCall(false)}
            title="Audio call"
            aria-label="Start audio call"
            disabled={!currentChannel}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
          >
            <Volume2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onStartCall(true)}
            title="Video call"
            aria-label="Start video call"
            disabled={!currentChannel}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-3 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3.5"
          >
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Call</span>
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-5 sm:px-5 sm:py-6">
        {isLoadingMessages ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-xs text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              Loading messages...
            </div>
          </div>
        ) : !currentChannel ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-linear-to-br from-indigo-100 to-violet-100 text-indigo-600 dark:from-indigo-500/20 dark:to-violet-500/20 dark:text-indigo-300">
              <MessagePlaceholder />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Your campus conversations
            </h3>
            <p className={`mt-1 max-w-xs text-xs leading-5 ${mutedText}`}>
              Select a channel or direct message to start chatting.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-linera-to-br from-indigo-100 to-violet-100 text-indigo-600 dark:from-indigo-500/20 dark:to-violet-500/20 dark:text-indigo-300">
              {isDirect ? (
                <User className="h-7 w-7" />
              ) : (
                <Hash className="h-7 w-7" />
              )}
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              {isDirect
                ? `Start chatting with ${friendName}`
                : `Welcome to #${currentChannel.name}!`}
            </h3>

            <p className={`mt-1 max-w-xs text-xs leading-5 ${mutedText}`}>
              Send a message, share a document, or attach a photo to get
              the conversation started.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe =
              Boolean(currentUserId && msg.senderId === currentUserId) ||
              Boolean(
                currentUserName && msg.senderName === currentUserName,
              );

            const fileFullUrl = getFileUrl(msg.fileUrl);

            return (
              <div
                key={msg.id}
                className={`flex w-full items-end gap-2.5 sm:gap-3 ${
                  isMe ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isMe && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-[11px] font-bold uppercase text-white shadow-sm">
                    {getInitials(msg.senderName)}
                  </div>
                )}

                <div
                  className={`flex min-w-0 max-w-[88%] flex-col sm:max-w-[75%] ${
                    isMe ? 'items-end' : 'items-start'
                  }`}
                >
                  {!isMe && (
                    <div className="mb-1 flex items-baseline gap-2 px-1">
                      <span className="max-w-50 truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}

                  <div
                    className={`min-w-0 rounded-2xl p-3 text-xs leading-relaxed shadow-sm sm:p-3.5 ${
                      isMe
                        ? 'rounded-br-md bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-indigo-500/10'
                        : 'rounded-bl-md border border-slate-200/80 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {/* Image attachment */}
                    {msg.fileType === 'IMAGE' && msg.fileUrl && (
                      <div className="mb-2 max-w-full overflow-hidden rounded-xl border border-black/5 bg-slate-100 dark:border-white/10 dark:bg-slate-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={fileFullUrl}
                          alt={msg.fileName || 'Photo attachment'}
                          loading="lazy"
                          className="max-h-80 max-w-full cursor-pointer object-contain transition hover:opacity-95"
                          onClick={() =>
                            window.open(
                              fileFullUrl,
                              '_blank',
                              'noopener,noreferrer',
                            )
                          }
                        />
                      </div>
                    )}

                    {/* PDF and document attachment */}
                    {(msg.fileType === 'PDF' ||
                      msg.fileType === 'DOCUMENT') &&
                      msg.fileUrl && (
                        <div
                          className={`mb-2 flex min-w-0 items-center justify-between gap-3 rounded-xl border p-3 ${
                            isMe
                              ? 'border-white/15 bg-black/10'
                              : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${
                                msg.fileType === 'PDF'
                                  ? 'bg-rose-500'
                                  : 'bg-indigo-500'
                              }`}
                            >
                              <FileText className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold">
                                {msg.fileName || 'Attachment'}
                              </p>
                              <p
                                className={`mt-1 text-[10px] ${
                                  isMe
                                    ? 'text-indigo-100'
                                    : 'text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {formatFileSize(msg.fileSize)}
                                {msg.fileSize ? ' · ' : ''}
                                {msg.fileType}
                              </p>
                            </div>
                          </div>

                          <a
                            href={fileFullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={msg.fileName || 'document'}
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                              isMe
                                ? 'bg-white/15 hover:bg-white/25'
                                : 'bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                            }`}
                            title="Download attachment"
                            aria-label="Download attachment"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      )}

                    {msg.content && (
                      <p className="whitespace-pre-wrap-break-words">
                        {msg.content}
                      </p>
                    )}

                    <div
                      className={`mt-1.5 flex items-center justify-end gap-1 text-[9px] ${
                        isMe
                          ? 'text-indigo-100/80'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMe && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Pending attachment preview */}
      {pendingFile && (
        <div className="mx-3 mb-2 flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/90 p-3 shadow-sm sm:mx-5 dark:border-indigo-500/30 dark:bg-indigo-500/10">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
              {pendingFile.fileType === 'IMAGE' ? (
                <ImageIcon className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800 dark:text-white">
                {pendingFile.fileName}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                {formatFileSize(pendingFile.fileSize)} · Ready to send
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPendingFile(null)}
            aria-label="Remove attachment"
            title="Remove attachment"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Attachment menu */}
      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close attachment menu"
            className="absolute inset-0 z-20 cursor-default"
            onClick={() => setMenuOpen(false)}
          />

          <div className="absolute bottom-21 left-3 z-30 flex w-56 flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 sm:left-5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
            <button
              type="button"
              onClick={() =>
                openFilePicker('.pdf,.doc,.docx,.txt,application/pdf')
              }
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-slate-700 transition hover:bg-indigo-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 text-white">
                <FileText className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-semibold">Document</span>
                <span className="mt-0.5 block text-[10px] text-slate-500 dark:text-slate-400">
                  PDF, DOC, DOCX, TXT
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => openFilePicker('image/*')}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-slate-700 transition hover:bg-emerald-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-white">
                <ImageIcon className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-semibold">Photos & images</span>
                <span className="mt-0.5 block text-[10px] text-slate-500 dark:text-slate-400">
                  Select an image to upload
                </span>
              </span>
            </button>
          </div>
        </>
      )}

      {/* Message composer */}
      <div className="shrink-0 border-t border-slate-200/80 bg-white/85 p-3 backdrop-blur-xl sm:p-4 dark:border-slate-800 dark:bg-slate-900/90">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 sm:px-3 dark:border-slate-700 dark:bg-slate-800"
        >
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            disabled={isUploading || !currentChannel}
            aria-label="Attach a file"
            aria-expanded={menuOpen}
            title="Attach document or image"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-40 ${
              menuOpen
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-300'
            }`}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder={
              !currentChannel
                ? 'Select a conversation first...'
                : pendingFile
                  ? 'Add a caption...'
                  : isDirect
                    ? `Message ${friendName}...`
                    : `Message #${currentChannel.name || 'general'}`
            }
            disabled={!currentChannel || isUploading}
            className="min-w-0 flex-1 bg-transparent py-2 text-xs text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-white dark:placeholder:text-slate-500"
          />

          <button
            type="submit"
            disabled={
              !currentChannel ||
              (!inputText.trim() && !pendingFile) ||
              isUploading
            }
            aria-label="Send message"
            title="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>

        <p className="mt-2 hidden text-center text-[10px] text-slate-400 sm:block dark:text-slate-500">
          Enter a message to chat with your campus community
        </p>
      </div>
    </main>
  );
}

function MessagePlaceholder() {
  return <MessageCircleIcon />;
}

function MessageCircleIcon() {
  return <Sparkles className="h-7 w-7" />;
}
