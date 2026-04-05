import { create } from 'zustand';

interface AppState {
  isOnboarded: boolean;
  userName: string;
  modelStatus: 'not_downloaded' | 'downloading' | 'downloaded' | 'loading' | 'ready' | 'error';
  modelProgress: number;
  setOnboarded: (value: boolean) => void;
  setUserName: (name: string) => void;
  setModelStatus: (status: AppState['modelStatus']) => void;
  setModelProgress: (progress: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnboarded: false,
  userName: '',
  modelStatus: 'not_downloaded',
  modelProgress: 0,
  setOnboarded: (value) => set({ isOnboarded: value }),
  setUserName: (name) => set({ userName: name }),
  setModelStatus: (status) => set({ modelStatus: status }),
  setModelProgress: (progress) => set({ modelProgress: progress }),
}));
