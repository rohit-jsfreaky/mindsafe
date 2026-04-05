import DatabaseService from './DatabaseService';
import EncryptionService from '../EncryptionService';
import { MoodLevel } from '../../types/mood';
import { getDaysAgo } from '../../utils/dateUtils';

export interface InsightsSummary {
  moodTrend: { week: string; average: number }[];
  topFactors: { factor: string; count: number }[];
  totalEntries: number;
  averageMood: number;
  daysTracked: number;
}

class InsightsRepository {
  async getMoodTrend(weeks: number = 4): Promise<{ week: string; average: number }[]> {
    const db = DatabaseService.getDb();
    const since = getDaysAgo(weeks * 7);

    const result = await db.execute(
      'SELECT level, logged_at FROM mood_logs WHERE logged_at >= ? ORDER BY logged_at ASC',
      [since],
    );

    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const buckets: number[][] = Array.from({ length: weeks }, () => []);

    for (const row of result.rows) {
      const age = now - (row.logged_at as number);
      const weekIndex = weeks - 1 - Math.min(Math.floor(age / weekMs), weeks - 1);
      buckets[weekIndex]!.push(row.level as number);
    }

    return buckets.map((levels, i) => ({
      week: `W${i + 1}`,
      average: levels.length > 0
        ? levels.reduce((a, b) => a + b, 0) / levels.length
        : 0,
    }));
  }

  async getPositiveFactors(
    days: number = 30,
    limit: number = 4,
  ): Promise<{ factor: string; count: number }[]> {
    const db = DatabaseService.getDb();
    const since = getDaysAgo(days);

    const result = await db.execute(
      'SELECT factors FROM mood_logs WHERE logged_at >= ? AND level >= 4 AND factors IS NOT NULL',
      [since],
    );

    const counts: Map<string, number> = new Map();

    for (const row of result.rows) {
      const factors: string[] = JSON.parse(row.factors as string);
      for (const f of factors) {
        counts.set(f, (counts.get(f) || 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .map(([factor, count]) => ({ factor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getSummary(days: number = 30): Promise<InsightsSummary> {
    const db = DatabaseService.getDb();
    const since = getDaysAgo(days);

    const countResult = await db.execute(
      'SELECT COUNT(*) as count FROM mood_logs WHERE logged_at >= ?',
      [since],
    );

    const avgResult = await db.execute(
      'SELECT AVG(level) as avg FROM mood_logs WHERE logged_at >= ?',
      [since],
    );

    const daysResult = await db.execute(
      `SELECT COUNT(DISTINCT date(logged_at / 1000, 'unixepoch')) as days
       FROM mood_logs WHERE logged_at >= ?`,
      [since],
    );

    const moodTrend = await this.getMoodTrend();
    const topFactors = await this.getPositiveFactors(days);

    return {
      moodTrend,
      topFactors,
      totalEntries: (countResult.rows[0]?.count as number) ?? 0,
      averageMood: (avgResult.rows[0]?.avg as number) ?? 0,
      daysTracked: (daysResult.rows[0]?.days as number) ?? 0,
    };
  }

  async getRecentMoodSummaryText(): Promise<string> {
    const summary = await this.getSummary(7);

    if (summary.totalEntries === 0) {
      return 'Start logging your mood to see weekly insights here.';
    }

    const avgLabel =
      summary.averageMood >= 4 ? 'good' :
      summary.averageMood >= 3 ? 'okay' :
      'challenging';

    const topFactor = summary.topFactors.length > 0
      ? summary.topFactors[0]!.factor.toLowerCase()
      : null;

    let text = `This week has been ${avgLabel} overall with ${summary.totalEntries} mood entries across ${summary.daysTracked} days.`;

    if (topFactor) {
      text += ` ${topFactor} appears to correlate with your best days.`;
    }

    return text;
  }

  async hasEnoughData(): Promise<boolean> {
    const db = DatabaseService.getDb();
    const since = getDaysAgo(7);

    const result = await db.execute(
      `SELECT COUNT(DISTINCT date(logged_at / 1000, 'unixepoch')) as days
       FROM mood_logs WHERE logged_at >= ?`,
      [since],
    );

    return ((result.rows[0]?.days as number) ?? 0) >= 3;
  }
}

export default new InsightsRepository();
