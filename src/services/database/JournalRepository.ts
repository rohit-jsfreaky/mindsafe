import { generateId as uuidv4 } from '../../utils/uuid';
import DatabaseService from './DatabaseService';
import EncryptionService from '../EncryptionService';
import { JournalEntry } from '../../types/journal';
import { MoodLevel } from '../../types/mood';

class JournalRepository {
  async createEntry(
    content: string,
    moodLevel?: MoodLevel,
    tags?: string[],
  ): Promise<JournalEntry> {
    const db = DatabaseService.getDb();
    const now = Date.now();
    const id = uuidv4();

    const encryptedContent = await EncryptionService.encrypt(content);

    await db.execute(
      `INSERT INTO journal_entries (id, encrypted_content, mood_level, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        encryptedContent,
        moodLevel ?? null,
        tags ? JSON.stringify(tags) : null,
        now,
        now,
      ],
    );

    return {
      id,
      content,
      moodLevel,
      tags,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateEntry(
    id: string,
    content: string,
    moodLevel?: MoodLevel,
    tags?: string[],
  ): Promise<void> {
    const db = DatabaseService.getDb();
    const encryptedContent = await EncryptionService.encrypt(content);

    await db.execute(
      `UPDATE journal_entries
       SET encrypted_content = ?, mood_level = ?, tags = ?, updated_at = ?
       WHERE id = ?`,
      [
        encryptedContent,
        moodLevel ?? null,
        tags ? JSON.stringify(tags) : null,
        Date.now(),
        id,
      ],
    );
  }

  async saveReflection(id: string, reflection: string): Promise<void> {
    const db = DatabaseService.getDb();
    const encryptedReflection = await EncryptionService.encrypt(reflection);

    await db.execute(
      'UPDATE journal_entries SET ai_reflection = ? WHERE id = ?',
      [encryptedReflection, id],
    );
  }

  async getEntry(id: string): Promise<JournalEntry | null> {
    const db = DatabaseService.getDb();
    const result = await db.execute(
      'SELECT * FROM journal_entries WHERE id = ?',
      [id],
    );

    if (result.rows.length === 0) return null;
    return this.rowToEntry(result.rows[0]!);
  }

  async getAllEntries(): Promise<JournalEntry[]> {
    const db = DatabaseService.getDb();
    const result = await db.execute(
      'SELECT * FROM journal_entries ORDER BY created_at DESC',
    );

    const entries: JournalEntry[] = [];
    for (const row of result.rows) {
      entries.push(await this.rowToEntry(row));
    }
    return entries;
  }

  async getRecentEntries(limit: number = 20): Promise<JournalEntry[]> {
    const db = DatabaseService.getDb();
    const result = await db.execute(
      'SELECT * FROM journal_entries ORDER BY created_at DESC LIMIT ?',
      [limit],
    );

    const entries: JournalEntry[] = [];
    for (const row of result.rows) {
      entries.push(await this.rowToEntry(row));
    }
    return entries;
  }

  async deleteEntry(id: string): Promise<void> {
    const db = DatabaseService.getDb();
    await db.execute('DELETE FROM journal_entries WHERE id = ?', [id]);
  }

  async getEntryCount(): Promise<number> {
    const db = DatabaseService.getDb();
    const result = await db.execute(
      'SELECT COUNT(*) as count FROM journal_entries',
    );
    return (result.rows[0]?.count as number) ?? 0;
  }

  private async rowToEntry(row: Record<string, any>): Promise<JournalEntry> {
    const content = await EncryptionService.decrypt(
      row.encrypted_content as string,
    );

    let aiReflection: string | undefined;
    if (row.ai_reflection) {
      aiReflection = await EncryptionService.decrypt(
        row.ai_reflection as string,
      );
    }

    return {
      id: row.id as string,
      content,
      moodLevel: row.mood_level as MoodLevel | undefined,
      tags: row.tags ? JSON.parse(row.tags as string) : undefined,
      aiReflection,
      createdAt: row.created_at as number,
      updatedAt: row.updated_at as number,
    };
  }
}

export default new JournalRepository();
