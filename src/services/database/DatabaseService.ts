import { open, DB } from '@op-engineering/op-sqlite';

const DB_NAME = 'mindsafe.db';

class DatabaseService {
  private db: DB | null = null;

  getDb(): DB {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = open({ name: DB_NAME });

    await this.createTables();
  }

  private async createTables(): Promise<void> {
    const db = this.getDb();

    await db.transaction(async (tx) => {
      await tx.execute(`
        CREATE TABLE IF NOT EXISTS journal_entries (
          id TEXT PRIMARY KEY,
          encrypted_content TEXT NOT NULL,
          mood_level INTEGER,
          tags TEXT,
          ai_reflection TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);

      await tx.execute(`
        CREATE TABLE IF NOT EXISTS mood_logs (
          id TEXT PRIMARY KEY,
          level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 5),
          emoji TEXT NOT NULL,
          note TEXT,
          factors TEXT,
          logged_at INTEGER NOT NULL
        );
      `);

      await tx.execute(`
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          title TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);

      await tx.execute(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
          content TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        );
      `);

      await tx.execute(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);

      // Indexes for common queries
      await tx.execute(`
        CREATE INDEX IF NOT EXISTS idx_mood_logs_logged_at ON mood_logs(logged_at);
      `);

      await tx.execute(`
        CREATE INDEX IF NOT EXISTS idx_journal_created_at ON journal_entries(created_at);
      `);

      await tx.execute(`
        CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
      `);
    });
  }

  async getSetting(key: string): Promise<string | null> {
    const db = this.getDb();
    const result = await db.execute(
      'SELECT value FROM settings WHERE key = ?',
      [key],
    );
    return result.rows.length > 0 ? (result.rows[0]!.value as string) : null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const db = this.getDb();
    await db.execute(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, value],
    );
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export default new DatabaseService();
