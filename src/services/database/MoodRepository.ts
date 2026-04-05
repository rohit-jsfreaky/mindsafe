import { generateId as uuidv4 } from '../../utils/uuid';
import DatabaseService from './DatabaseService';
import { MoodEntry, MoodLevel, WeeklyMoodData, MoodFactor } from '../../types/mood';
import { DAYS_OF_WEEK } from '../../utils/constants';
import { getDayOfWeek, getStartOfWeek, getDaysAgo } from '../../utils/dateUtils';

class MoodRepository {
  async logMood(
    level: MoodLevel,
    emoji: string,
    note?: string,
    factors?: string[],
  ): Promise<MoodEntry> {
    const db = DatabaseService.getDb();
    const entry: MoodEntry = {
      id: uuidv4(),
      level,
      emoji,
      note,
      factors,
      loggedAt: Date.now(),
    };

    await db.execute(
      'INSERT INTO mood_logs (id, level, emoji, note, factors, logged_at) VALUES (?, ?, ?, ?, ?, ?)',
      [
        entry.id,
        entry.level,
        entry.emoji,
        entry.note ?? null,
        entry.factors ? JSON.stringify(entry.factors) : null,
        entry.loggedAt,
      ],
    );

    return entry;
  }

  async getTodaysMoods(): Promise<MoodEntry[]> {
    const db = DatabaseService.getDb();
    const startOfDay = getDaysAgo(0);

    const result = await db.execute(
      'SELECT * FROM mood_logs WHERE logged_at >= ? ORDER BY logged_at DESC',
      [startOfDay],
    );

    return result.rows.map(this.rowToMoodEntry);
  }

  async getWeeklyData(): Promise<WeeklyMoodData[]> {
    const db = DatabaseService.getDb();
    const weekStart = getStartOfWeek();

    const result = await db.execute(
      'SELECT * FROM mood_logs WHERE logged_at >= ? ORDER BY logged_at ASC',
      [weekStart],
    );

    // Initialize all days with empty arrays
    const weekData: WeeklyMoodData[] = DAYS_OF_WEEK.map((day) => ({
      day,
      levels: [],
    }));

    for (const row of result.rows) {
      const entry = this.rowToMoodEntry(row);
      const dayIndex = getDayOfWeek(entry.loggedAt);
      if (dayIndex >= 0 && dayIndex < 7) {
        weekData[dayIndex]!.levels.push(entry.level);
      }
    }

    return weekData;
  }

  async getRecentEntries(days: number = 30): Promise<MoodEntry[]> {
    const db = DatabaseService.getDb();
    const since = getDaysAgo(days);

    const result = await db.execute(
      'SELECT * FROM mood_logs WHERE logged_at >= ? ORDER BY logged_at DESC',
      [since],
    );

    return result.rows.map(this.rowToMoodEntry);
  }

  async getWeeklyAverages(weeks: number = 4): Promise<{ week: string; average: number }[]> {
    const db = DatabaseService.getDb();
    const since = getDaysAgo(weeks * 7);

    const result = await db.execute(
      'SELECT * FROM mood_logs WHERE logged_at >= ? ORDER BY logged_at ASC',
      [since],
    );

    const entries = result.rows.map(this.rowToMoodEntry);
    const weekBuckets: Map<number, number[]> = new Map();

    for (const entry of entries) {
      const weekIndex = Math.floor((Date.now() - entry.loggedAt) / (7 * 24 * 60 * 60 * 1000));
      const bucket = weeks - 1 - weekIndex; // Reverse so W1 = oldest
      if (!weekBuckets.has(bucket)) {
        weekBuckets.set(bucket, []);
      }
      weekBuckets.get(bucket)!.push(entry.level);
    }

    const averages: { week: string; average: number }[] = [];
    for (let i = 0; i < weeks; i++) {
      const levels = weekBuckets.get(i) || [];
      const avg = levels.length > 0
        ? levels.reduce((a, b) => a + b, 0) / levels.length
        : 0;
      averages.push({ week: `W${i + 1}`, average: avg });
    }

    return averages;
  }

  async getTopFactors(days: number = 30, limit: number = 4): Promise<MoodFactor[]> {
    const db = DatabaseService.getDb();
    const since = getDaysAgo(days);

    // Get entries with good/great moods that have factors
    const result = await db.execute(
      'SELECT factors FROM mood_logs WHERE logged_at >= ? AND level >= 4 AND factors IS NOT NULL',
      [since],
    );

    const factorCounts: Map<string, number> = new Map();

    for (const row of result.rows) {
      const factors: string[] = JSON.parse(row.factors as string);
      for (const factor of factors) {
        factorCounts.set(factor, (factorCounts.get(factor) || 0) + 1);
      }
    }

    return Array.from(factorCounts.entries())
      .map(([factor, count]) => ({ factor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async deleteMood(id: string): Promise<void> {
    const db = DatabaseService.getDb();
    await db.execute('DELETE FROM mood_logs WHERE id = ?', [id]);
  }

  private rowToMoodEntry(row: Record<string, any>): MoodEntry {
    return {
      id: row.id as string,
      level: row.level as MoodLevel,
      emoji: row.emoji as string,
      note: row.note as string | undefined,
      factors: row.factors ? JSON.parse(row.factors as string) : undefined,
      loggedAt: row.logged_at as number,
    };
  }
}

export default new MoodRepository();
