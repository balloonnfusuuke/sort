export interface Participant {
  id: string;
  originalName: string;
  normalizedName: string;
  reading: string; // Katakana for sorting
  count: number;
  // checked property removed as we are optimizing for print
}

export interface ParseResult {
  success: boolean;
  data?: any[];
  error?: string;
}

export enum AppState {
  IDLE,
  PROCESSING,
  COMPLETE,
  ERROR
}
