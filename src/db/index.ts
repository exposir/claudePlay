import Dexie, { Table } from 'dexie';
import { Conversation } from '../types/chat';

export class ChatDatabase extends Dexie {
  conversations!: Table<Conversation>;

  constructor() {
    super('ClaudePlayDB');
    this.version(1).stores({
      conversations: 'id, updatedAt, pinned' // Indexes for fast querying
    });
  }
}

export const db = new ChatDatabase();
