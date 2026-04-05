export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number; // Unix timestamp ms
}

export interface Conversation {
  id: string;
  title?: string;
  lastMessage?: string;
  createdAt: number;
  updatedAt: number;
}
