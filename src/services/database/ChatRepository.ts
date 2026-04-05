import { generateId as uuidv4 } from '../../utils/uuid';
import DatabaseService from './DatabaseService';
import EncryptionService from '../EncryptionService';
import { Message, Conversation } from '../../types/chat';

class ChatRepository {
  async createConversation(title?: string): Promise<Conversation> {
    const db = DatabaseService.getDb();
    const now = Date.now();
    const id = uuidv4();

    await db.execute(
      'INSERT INTO conversations (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)',
      [id, title ?? null, now, now],
    );

    return { id, title, createdAt: now, updatedAt: now };
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const db = DatabaseService.getDb();
    const result = await db.execute(
      'SELECT * FROM conversations WHERE id = ?',
      [id],
    );

    if (result.rows.length === 0) return null;
    return this.rowToConversation(result.rows[0]!);
  }

  async getLatestConversation(): Promise<Conversation | null> {
    const db = DatabaseService.getDb();
    const result = await db.execute(
      'SELECT * FROM conversations ORDER BY updated_at DESC LIMIT 1',
    );

    if (result.rows.length === 0) return null;

    const conversation = this.rowToConversation(result.rows[0]!);

    // Get last message for subtitle
    const msgResult = await db.execute(
      'SELECT content FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1',
      [conversation.id],
    );

    if (msgResult.rows.length > 0) {
      conversation.lastMessage = await EncryptionService.decrypt(
        msgResult.rows[0]!.content as string,
      );
    }

    return conversation;
  }

  async updateConversationTitle(id: string, title: string): Promise<void> {
    const db = DatabaseService.getDb();
    await db.execute(
      'UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?',
      [title, Date.now(), id],
    );
  }

  async addMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<Message> {
    const db = DatabaseService.getDb();
    const id = uuidv4();
    const now = Date.now();

    const encryptedContent = await EncryptionService.encrypt(content);

    await db.transaction(async (tx) => {
      await tx.execute(
        'INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)',
        [id, conversationId, role, encryptedContent, now],
      );

      await tx.execute(
        'UPDATE conversations SET updated_at = ? WHERE id = ?',
        [now, conversationId],
      );
    });

    return { id, conversationId, role, content, createdAt: now };
  }

  async getMessages(
    conversationId: string,
    limit?: number,
  ): Promise<Message[]> {
    const db = DatabaseService.getDb();
    const query = limit
      ? 'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ?'
      : 'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC';
    const params = limit ? [conversationId, limit] : [conversationId];

    const result = await db.execute(query, params);

    const messages: Message[] = [];
    for (const row of result.rows) {
      messages.push(await this.rowToMessage(row));
    }
    return messages;
  }

  async getRecentMessages(
    conversationId: string,
    limit: number = 8,
  ): Promise<Message[]> {
    const db = DatabaseService.getDb();
    // Get last N messages, then reverse to chronological order
    const result = await db.execute(
      'SELECT * FROM (SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?) ORDER BY created_at ASC',
      [conversationId, limit],
    );

    const messages: Message[] = [];
    for (const row of result.rows) {
      messages.push(await this.rowToMessage(row));
    }
    return messages;
  }

  async deleteConversation(id: string): Promise<void> {
    const db = DatabaseService.getDb();
    await db.transaction(async (tx) => {
      await tx.execute('DELETE FROM messages WHERE conversation_id = ?', [id]);
      await tx.execute('DELETE FROM conversations WHERE id = ?', [id]);
    });
  }

  async getMessageCount(conversationId: string): Promise<number> {
    const db = DatabaseService.getDb();
    const result = await db.execute(
      'SELECT COUNT(*) as count FROM messages WHERE conversation_id = ?',
      [conversationId],
    );
    return (result.rows[0]?.count as number) ?? 0;
  }

  private rowToConversation(row: Record<string, any>): Conversation {
    return {
      id: row.id as string,
      title: row.title as string | undefined,
      createdAt: row.created_at as number,
      updatedAt: row.updated_at as number,
    };
  }

  private async rowToMessage(row: Record<string, any>): Promise<Message> {
    const content = await EncryptionService.decrypt(row.content as string);

    return {
      id: row.id as string,
      conversationId: row.conversation_id as string,
      role: row.role as 'user' | 'assistant',
      content,
      createdAt: row.created_at as number,
    };
  }
}

export default new ChatRepository();
