import { MoodLevel } from './mood';

export interface JournalEntry {
  id: string;
  content: string;
  moodLevel?: MoodLevel;
  tags?: string[];
  aiReflection?: string;
  createdAt: number; // Unix timestamp ms
  updatedAt: number;
}
