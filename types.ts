export enum AppStep {
  WELCOME = 'WELCOME',
  MORNING_RECALL = 'MORNING_RECALL',
  MID_MORNING_RECALL = 'MID_MORNING_RECALL',
  MEMORY_ENCODING = 'MEMORY_ENCODING',
  AFTERNOON_RECALL = 'AFTERNOON_RECALL',
  MID_AFTERNOON_RECALL = 'MID_AFTERNOON_RECALL',
  SPATIAL_RECALL = 'SPATIAL_RECALL',
  ANECDOTE = 'ANECDOTE',
  MEMORY_RETRIEVAL = 'MEMORY_RETRIEVAL',
  ANALYSIS = 'ANALYSIS',
  COMPLETED = 'COMPLETED',
  HISTORY = 'HISTORY'
}

export type SessionMode = 'MORNING' | 'EVENING';

export interface JournalData {
  id: string;
  date: string;
  timestamp: number;
  sessionType: SessionMode;
  morning: string;
  midMorning: string;
  afternoon: string;
  midAfternoon: string;
  spatial: string;
  anecdote: string;
  memoryScore: number;
  feedback?: string;
  synced?: boolean; // Nuevo campo para control offline/online
}

export interface MemoryItem {
  id: string;
  emoji: string;
  name: string;
}