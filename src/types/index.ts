export type Language = 'en' | 'bn';

export type TabType = 'studio' | 'batch' | 'pricing' | 'faq' | 'privacy';

export type BackgroundType = 'transparent' | 'color' | 'gradient' | 'blur' | 'custom';

export type CropPreset = 'original' | '1:1' | '4:5' | '16:9' | '9:16' | 'passport' | 'ecommerce';

export type BrushMode = 'erase' | 'restore';

export interface RefineSettings {
  tolerance: number; // 0 - 100
  feather: number; // 0 - 30
  smoothEdges: boolean;
  mattingRadius: number; // 1 - 10
  despill: boolean; // removes color cast on edges
  contrast: number; // 0 - 100
}

export interface ShadowSettings {
  enabled: boolean;
  blur: number; // 0 - 50
  opacity: number; // 0 - 100
  offsetX: number; // -50 - 50
  offsetY: number; // -50 - 50
  color: string;
  type: 'drop' | 'ground';
}

export interface BorderSettings {
  enabled: boolean;
  width: number; // 1 - 30
  color: string;
}

export interface BackgroundSettings {
  type: BackgroundType;
  color: string;
  gradient: string;
  blurAmount: number; // 0 - 50
  customImage: string | null;
}

export interface ImageProcessingState {
  originalUrl: string;
  originalImage: HTMLImageElement | null;
  processedUrl: string | null;
  processedImage: HTMLImageElement | null;
  maskCanvas: HTMLCanvasElement | null; // Alpha mask at full res
  isProcessing: boolean;
  progress: number;
  progressStage: string;
  width: number;
  height: number;
  fileSize: number;
  fileName: string;
  fileType: string;
}

export interface BatchItem {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  resultUrl: string | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  processedAt?: number;
}

export interface HistoryItem {
  id: string;
  thumbnailUrl: string;
  resultUrl: string;
  name: string;
  timestamp: number;
  size: number;
}
