export interface FriendProfile {
  id: string;
  name: string;
  email: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string | null;
  isDirect?: boolean;
  friend?: FriendProfile;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  channelId: string;
  senderId: string;
  senderName: string;
  fileUrl?: string | null;
  fileType?: 'IMAGE' | 'PDF' | 'DOCUMENT' | string | null;
  fileName?: string | null;
  fileSize?: number | null;
  createdAt: string;
}