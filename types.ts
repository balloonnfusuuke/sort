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

export type PageOrientation = 'portrait' | 'landscape';

export interface PrintSettings {
  orientation: PageOrientation;
  columns: number;      // 1-6
  fontSize: number;     // px (base font size)
  rowPadding: number;   // px (vertical padding)
  checkboxSize: number; // px (memo width)
  headerFontSize: number; // px (index header size)
}
