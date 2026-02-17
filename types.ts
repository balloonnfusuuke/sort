export interface Participant {
  id: string;
  originalName: string;
  normalizedName: string;
  reading: string; // Katakana for sorting
  count: number;
  isRef?: boolean; // If true, this is a reference entry (kept in Others) and shouldn't be counted in stats
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
  titleFontSize: number; // px (main title size)
  
  // Header Customization
  title: string;
  date: string;
  subtitle: string;

  // Extra Features
  walkInSlots: number; // Number of empty rows for walk-ins
}

export interface PrintPreset {
  id: string;
  name: string;
  settings: PrintSettings;
}