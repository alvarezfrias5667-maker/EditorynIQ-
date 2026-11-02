export type VisualAssetType = 'cover' | 'illustration' | 'diagram' | 'chart' | 'infographic';

export type SourceType = 'USER_UPLOAD' | 'VECTOR_EDITOR' | 'DATA_RENDER' | 'VERIFIED_AI_GENERATION';

export type RightsStatus = 'RIGHTS_UNVERIFIED' | 'RIGHTS_DECLARED' | 'RIGHTS_REVIEW_REQUIRED' | 'RIGHTS_APPROVED';

export interface LicenseInfo {
  licenseName: string;
  creatorName?: string;
  sourceUrl?: string;
  usageNotes?: string;
}

export interface VisualIdentityProfile {
  bookId: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    dark: string;
    light: string;
    background: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    monoFont: string;
  };
  styleName: 'editorial-minimal' | 'modern-technical' | 'classic-serif' | 'vibrant-digital';
  proportions: '6x9' | '8.5x11' | 'a4' | 'custom';
  language: 'en' | 'es';
  editorialProfile: string;
  authorPreferences: string;
  consistencyRules: string[];
  updatedAt: string;
}

export interface VisualAsset {
  id: string;
  bookId: string;
  assetType: VisualAssetType;
  sourceType: SourceType;
  createdAt: string;
  updatedAt: string;
  version: number;
  rightsStatus: RightsStatus;
  chapterId?: string;
  title: string;
  description?: string;
  sha256?: string;
  svgContent?: string;
  dataUrl?: string;
  fileSize?: number;
  mimeType: string;
  licenseInfo: LicenseInfo;
  metadata: Record<string, any>;
}

// Cover Specifics
export interface CoverLayer {
  id: string;
  type: 'text' | 'rect' | 'circle' | 'line' | 'badge';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  rotation?: number;
  opacity?: number;
}

export type PrintProvider = 'KDP_PAPERBACK' | 'INGRAMSPARK_TEMPLATE_REQUIRED';
export type InkPaperType = 'BW_WHITE' | 'BW_CREAM' | 'PREMIUM_COLOR' | 'STANDARD_COLOR';
export type TrimSizeOption = '6x9' | '5.5x8.5' | '5x8' | '8.5x11';

export interface PrintCoverConfig {
  provider: PrintProvider;
  trimSize: TrimSizeOption;
  inkPaperType: InkPaperType;
  pageCount: number;
  pageCountVerified: boolean;
  isQaContext?: boolean;
  hasOfficialTemplate?: boolean;
}

export interface PrintGeometry {
  trimWidthInches: number;
  trimHeightInches: number;
  bleedInches: number;
  spineWidthInches: number;
  totalWidthInches: number;
  totalHeightInches: number;
  trimWidthMm: number;
  trimHeightMm: number;
  bleedMm: number;
  spineWidthMm: number;
  totalWidthMm: number;
  totalHeightMm: number;
  safeMarginInches: number;
  spineTextEligible: boolean;
  spineSafetyMarginInches: number;
  backCoverRect: { x: number; y: number; width: number; height: number };
  spineRect: { x: number; y: number; width: number; height: number };
  frontCoverRect: { x: number; y: number; width: number; height: number };
  barcodeRect: { x: number; y: number; width: number; height: number };
}

export type QualityGate4BAStatus =
  | 'DESIGN_READY'
  | 'NEEDS_FIX'
  | 'INTERIOR_NOT_VERIFIED'
  | 'TEMPLATE_REQUIRED'
  | 'BLOCKED_EXTERNAL';

export interface QualityGate4BAReport {
  status: QualityGate4BAStatus;
  score: number;
  checks: { name: string; passed: boolean; details: string }[];
  geometry?: PrintGeometry;
}

export interface CoverDesignSpec {
  frontTitle: string;
  frontSubtitle: string;
  authorName: string;
  publisherName: string;
  backCoverBlurb: string;
  spineTitle: string;
  spineAuthor: string;
  spineWidthMm: number;
  bgColor: string;
  accentColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
  style?: 'text-first' | 'visual-first' | 'technical-first';
  printConfig?: PrintCoverConfig;
  layers: CoverLayer[];
}

// Technical Diagram Specifics
export interface DiagramNode {
  id: string;
  label: string;
  type: 'process' | 'decision' | 'database' | 'system' | 'start_end';
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor?: string;
  textColor?: string;
}

export interface DiagramEdge {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
}

export interface DiagramSpec {
  diagramType: 'flowchart' | 'block' | 'process' | 'hierarchy' | 'architecture';
  title: string;
  description?: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

// Data Chart Specifics
export interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
  color?: string;
}

export interface ChartSpec {
  chartType: 'bar' | 'line' | 'pie' | 'time_series' | 'comparative';
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  unit: string;
  sourceCitation: string;
  dataPoints: ChartDataPoint[];
}

// Infographic Specifics
export interface InfographicBlock {
  id: string;
  title: string;
  content: string;
  highlightNumber?: string;
  highlightUnit?: string;
  iconType?: 'star' | 'chart' | 'book' | 'shield' | 'zap' | 'check';
  blockType: 'text' | 'metric' | 'step' | 'quote';
}

export interface InfographicSpec {
  title: string;
  subtitle: string;
  topic: string;
  footerReference: string;
  blocks: InfographicBlock[];
}

// Readiness & Audit
export interface E3ReadinessCheck {
  id: string;
  category: 'COVERS' | 'ILLUSTRATIONS' | 'DIAGRAMS' | 'CHARTS' | 'INFOGRAPHICS' | 'RIGHTS' | 'CONSISTENCY';
  title: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  details: string;
}

export interface E3ReadinessReport {
  bookId: string;
  evaluatedAt: string;
  score: number; // 0 - 100
  overallStatus: 'READY' | 'NEEDS_ATTENTION' | 'INCOMPLETE';
  checks: E3ReadinessCheck[];
  totalAssetsCount: number;
  unverifiedRightsCount: number;
}

// Phase 4C Art Direction & Quality Gate 4C Types
export type QualityGate4CStatus =
  | 'ASSET_READY'
  | 'ART_DIRECTION_READY'
  | 'NEEDS_FIX'
  | 'ASSETS_MISSING'
  | 'RIGHTS_NOT_VERIFIED'
  | 'PERSISTENCE_BLOCKED'
  | 'BLOCKED_SCOPE';

export interface VisualArtBrief {
  bookId: string;
  editionId?: string;
  language: 'en' | 'es';
  editorialProfile: 'text-first' | 'visual-first' | 'technical-first';
  visualTheme: string;
  targetAudience: string;
  styleKeywords: string[];
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  updatedAt: string;
}

export interface VisualStyleGuide {
  bookId: string;
  headingFont: string;
  bodyFont: string;
  illustrationStyle: string;
  iconographyStyle: string;
  compositionRules: string[];
  photoTreatment: string;
  namingConvention: string;
}

export interface ChapterVisualMapping {
  bookId: string;
  editionId?: string;
  chapterId: string;
  assetId: string;
  version: number;
  editorialRole: 'hero_illustration' | 'diagram' | 'chart' | 'infographic' | 'ornament';
  proposedOrder: number;
  caption: string;
  altText: string;
  longDescription?: string;
  language: 'en' | 'es';
  suggestedPosition: 'inline' | 'full_page' | 'header';
}

export interface QualityGate4CReport {
  status: QualityGate4CStatus;
  score: number;
  checks: Array<{
    id: string;
    name: string;
    passed: boolean;
    details: string;
  }>;
  aiStatus: {
    code: string;
    message: string;
    isIndependent: true;
  };
  assetMetrics?: {
    totalAssets: number;
    dpiVerified: boolean;
    rightsVerified: boolean;
    sanitizedSvgCount: number;
  };
}
