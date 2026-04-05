import type { RNLlamaOAICompatibleMessage } from 'llama.rn';
import { Message } from '../../types/chat';
import { SYSTEM_PROMPTS } from './PromptTemplates';
import { CHAT_CONFIG } from '../../utils/constants';

/**
 * Manages the context window for AI conversations.
 * Keeps only the last N messages to stay within the model's context limit.
 * Prepends the system prompt on every call.
 */
class ConversationManager {
  /**
   * Build the messages array to send to the model for a chat conversation.
   * Takes the full message history and trims to the context window.
   */
  buildChatContext(
    messages: Message[],
    systemPrompt: string = SYSTEM_PROMPTS.therapist,
  ): RNLlamaOAICompatibleMessage[] {
    // Take only the last N messages to fit context window
    const maxMessages = CHAT_CONFIG.maxContextMessages;
    const recentMessages = messages.slice(-maxMessages);

    const formatted: RNLlamaOAICompatibleMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    for (const msg of recentMessages) {
      formatted.push({
        role: msg.role,
        content: msg.content,
      });
    }

    return formatted;
  }

  /**
   * Build context for a one-shot completion (journal reflection, mood insight).
   * No history needed — just system prompt + single user message.
   */
  buildOneShotContext(
    systemPrompt: string,
    userMessage: string,
  ): RNLlamaOAICompatibleMessage[] {
    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];
  }

  /**
   * Estimate token count for a set of messages.
   * Rough heuristic: ~4 chars per token for English text.
   */
  estimateTokenCount(messages: RNLlamaOAICompatibleMessage[]): number {
    let totalChars = 0;
    for (const msg of messages) {
      if (typeof msg.content === 'string') {
        totalChars += msg.content.length;
      }
    }
    return Math.ceil(totalChars / 4);
  }

  /**
   * Check if the conversation is getting too long and should be trimmed.
   */
  shouldTrim(messages: Message[]): boolean {
    return messages.length > CHAT_CONFIG.maxContextMessages;
  }
}

export default new ConversationManager();
