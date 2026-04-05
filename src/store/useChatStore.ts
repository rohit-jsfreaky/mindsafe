import { create } from 'zustand';
import { Message, Conversation } from '../types/chat';

interface ChatState {
  currentConversation: Conversation | null;
  messages: Message[];
  isGenerating: boolean;
  streamingText: string;

  setCurrentConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setIsGenerating: (value: boolean) => void;
  setStreamingText: (text: string) => void;
  appendStreamingToken: (token: string) => void;
  clearStreamingText: () => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentConversation: null,
  messages: [],
  isGenerating: false,
  streamingText: '',

  setCurrentConversation: (conversation) =>
    set({ currentConversation: conversation }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setIsGenerating: (value) => set({ isGenerating: value }),

  setStreamingText: (text) => set({ streamingText: text }),

  appendStreamingToken: (token) =>
    set((state) => ({ streamingText: state.streamingText + token })),

  clearStreamingText: () => set({ streamingText: '' }),

  clearChat: () =>
    set({
      currentConversation: null,
      messages: [],
      isGenerating: false,
      streamingText: '',
    }),
}));
