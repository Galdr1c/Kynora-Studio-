export interface BrandGuideline {
  pillar: string;
  description: string;
  rules: string[];
}

export interface BrandMission {
  statement: string;
  values: string[];
}

export type ColorBlindnessType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';

export interface AnimationKeyframe {
  id: string;
  time: number; // 0 to duration
  value: number;
  easing: EasingType;
}

export interface AnimationTrack {
  property: 'x' | 'y' | 'scale' | 'rotation' | 'opacity';
  keyframes: AnimationKeyframe[];
}

export interface LayerAnimation {
  layerId: string;
  tracks: AnimationTrack[];
}

export interface CustomGuide {
  id: string;
  orientation: 'horizontal' | 'vertical';
  position: number; // Percentage 0-100
}

export interface EditorSettings {
  showGrid: boolean;
  gridSize: 8 | 12 | 16 | 32;
  snapToGrid: boolean;
  showSmartGuides: boolean;
  showGoldenRatio: boolean;
  showRulers: boolean;
  customGuides: CustomGuide[];
}

export interface LogoLayer {
  id: string;
  type: 'icon' | 'text' | 'slogan';
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  opacity: number;
  isVisible: boolean;
  isLocked: boolean;
  lockedBy?: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'light' | 'regular' | 'medium' | 'bold';
  letterSpacing?: number;
}

export interface DesignSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'layout' | 'color' | 'typography' | 'accessibility' | 'style';
  layerUpdates: Record<string, Partial<LogoLayer>>;
  globalUpdates?: {
    primaryColor?: string;
    brandName?: string;
    slogan?: string;
    style?: BrandTheme;
  };
}

export interface BrandKitAsset {
  id: string;
  type: 'business-card' | 'social' | 'product' | 'print' | 'presentation' | 'stationery' | 'guidelines';
  label: string;
  imageUrl: string;
  description: string;
}

export interface BrandKit {
  logoId: string;
  assets: BrandKitAsset[];
}

export interface LogoVariant {
  id: string;
  type: 'primary' | 'secondary' | 'icon' | 'text' | 'monochrome' | 'inverted' | 'stacked' | 'horizontal' | 'compact' | 'watermark';
  label: string;
  usageHint: string;
  lightUrl: string;
  darkUrl: string;
}

export interface MetricDetail {
  score: number;
  feedback: string;
}

export interface LogoEffectivenessReport {
  overall_score: number;
  complexity: MetricDetail;
  memorability: MetricDetail;
  versatility: MetricDetail;
  uniqueness: MetricDetail;
  industry_fit: MetricDetail;
  cultural_sensitivity: { feedback: string };
  trend_alignment: { feedback: string };
  suggestions: string[];
}

export interface LogoStyle {
  id: string;
  styleId: string;
  label: string;
  imageUrl: string;
  intensity: number;
}

export interface GeneratedLogo {
  id: string;
  url: string; 
  darkUrl: string; 
  prompt: string;
  brandName: string;
  slogan?: string;
  layout: 'horizontal' | 'vertical' | 'avatar' | 'header';
  layers: LogoLayer[];
  animations?: LayerAnimation[];
  timestamp: number;
  palette?: ColorPalette;
  guidelines?: BrandGuideline[];
  mission?: BrandMission;
  videoUrl?: string;
  audioUrl?: string;
  brandKit?: BrandKit;
  variants?: LogoVariant[];
  effectivenessReport?: LogoEffectivenessReport;
  styledVersions?: LogoStyle[];
}

export interface BrandColor {
  name: string;
  hex: string;
  darkHex: string; 
  type: 'primary' | 'secondary' | 'accent' | 'neutral';
}

export interface ColorPalette {
  colors: BrandColor[];
}

export type BrandTheme = 'modern' | 'minimalist' | 'classic' | 'playful' | 'tech' | 'vintage' | 'luxury';
export type BrandTone = 'sophisticated' | 'vibrant' | 'organic' | 'industrial';
export type TargetAudience = 'luxury' | 'casual' | 'health-conscious' | 'traditional';

export interface BrandAsset {
  label: string;
  description: string;
  imageUrl: string;
}

// Interface for real-time collaboration users
export interface Collaborator {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

// Interface for chat messages in collaboration sessions
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  text: string;
  timestamp: number;
}