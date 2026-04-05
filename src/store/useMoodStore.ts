import { create } from 'zustand';
import { MoodEntry, MoodLevel, WeeklyMoodData } from '../types/mood';

interface MoodState {
  todaysMoods: MoodEntry[];
  weeklyData: WeeklyMoodData[];
  latestMood: MoodLevel | null;

  setTodaysMoods: (moods: MoodEntry[]) => void;
  setWeeklyData: (data: WeeklyMoodData[]) => void;
  addMoodEntry: (entry: MoodEntry) => void;
  setLatestMood: (level: MoodLevel | null) => void;
}

export const useMoodStore = create<MoodState>((set) => ({
  todaysMoods: [],
  weeklyData: [],
  latestMood: null,

  setTodaysMoods: (moods) =>
    set({
      todaysMoods: moods,
      latestMood: moods.length > 0 ? moods[0]!.level : null,
    }),

  setWeeklyData: (data) => set({ weeklyData: data }),

  addMoodEntry: (entry) =>
    set((state) => ({
      todaysMoods: [entry, ...state.todaysMoods],
      latestMood: entry.level,
    })),

  setLatestMood: (level) => set({ latestMood: level }),
}));
