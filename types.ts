export type Language = 'en' | 'es';

export interface RoofOption {
  id: string;
  name: string;
  name_es: string;
  description: string;
  description_es: string;
}

export interface ColorOption {
  id: string;
  name: string;
  name_es: string;
  hex: string;
}

export interface AnalysisResult {
  style: string;
  recommendations: string[];
  reasoning: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  READY_TO_EDIT = 'READY_TO_EDIT',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}