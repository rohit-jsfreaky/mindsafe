export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  id: string;
  level: MoodLevel;
  emoji: string;
  note?: string;
  factors?: string[];
  loggedAt: number; // Unix timestamp ms
}

export interface WeeklyMoodData {
  day: string; // 'Mon', 'Tue', etc.
  levels: MoodLevel[]; // Could have multiple entries per day
}

export interface MoodFactor {
  factor: string;
  count: number;
}
