export type CollageLayoutType = 
  | 'grid-30'
  | 'hero-timeline'
  | 'magazine'
  | 'heart'
  | 'calendar'
  | 'milestone-poster'
  | 'minimalist-wall';

export type ThemeId =
  | 'timeless-cream'
  | 'soft-blue'
  | 'sage-garden'
  | 'teddy-bear'
  | 'minimalist-studio'
  | 'pastel-dream'
  | 'elegant-white'
  | 'warm-vintage'
  | 'celestial-night'
  | 'luxury-editorial';

export type CanvasDimensionId =
  | 'square-1-1'
  | 'portrait-4-5'
  | 'portrait-3-4'
  | 'poster-2-3'
  | 'print-a4'
  | 'print-a3'
  | 'custom';

export interface CanvasDimension {
  id: CanvasDimensionId;
  label: string;
  ratio: string;
  width: number;
  height: number;
  description: string;
  aspectRatio: number; // width / height
}

export interface PhotoCrop {
  x: number; // 0 to 1 (center offset)
  y: number; // 0 to 1 (center offset)
  scale: number; // 1.0 to 3.0
  rotation: number; // 0, 90, 180, 270
}

export interface DayPhoto {
  id: string;
  dayNumber: number; // 1 to 30
  dataUrl: string; // Base64 data URL
  fileName: string;
  fileSize: number;
  mimeType: string;
  dateTaken?: string; // YYYY-MM-DD
  isPrimary: boolean;
  crop: PhotoCrop;
  caption?: string;
  createdAt: number;
}

export interface BabyProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string;
  birthWeight?: string;
  birthLength?: string;
  profilePhoto?: string;
  notes?: string;
}

export interface CollageTheme {
  id: ThemeId;
  name: string;
  description: string;
  category: 'Classic' | 'Modern' | 'Pastel' | 'Vintage' | 'Luxury' | 'Warm';
  bgColor: string;
  bgSecondaryColor?: string;
  bgPattern?: 'none' | 'dots' | 'linen' | 'stars' | 'botanical' | 'vintage-grain';
  textColor: string;
  subtitleColor: string;
  accentColor: string;
  cardBg: string;
  borderColor: string;
  borderWidth: number;
  badgeBg: string;
  badgeTextColor: string;
  badgeBorderColor?: string;
  fontHeading: string;
  fontBody: string;
  shadow: string;
  borderRadius: number;
  cornerOrnament?: 'none' | 'delicate-corner' | 'stars' | 'botanical-sprig';
}

export interface CollageConfig {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  layout: CollageLayoutType;
  themeId: ThemeId;
  dimensionId: CanvasDimensionId;
  customWidth?: number;
  customHeight?: number;
  heroDay: number; // Day assigned as hero (1-30)
  spacing: number; // Gap between photos (px)
  outerPadding: number; // Canvas margin (px)
  borderRadius: number; // Photo corner radius (px)
  borderWidth: number; // Photo border width (px)
  borderColor: string; // Photo border color override or theme default
  shadowEnabled: boolean;
  showDayNumbers: boolean;
  dayNumberFormat: 'Day X' | '#X' | 'X';
  showDates: boolean;
  showBabyInfo: boolean;
  title: string;
  subtitle: string;
  milestoneText: string;
  showDecorations: boolean;
  cropOverrides?: Record<number, PhotoCrop>;
}

export interface Project {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  config: CollageConfig;
  thumbnail?: string;
}
