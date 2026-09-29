export interface CurvePoint {
  x: number; // 0 to 1
  y: number; // 0 to 1
}

export interface RGBVec {
  r: number;
  g: number;
  b: number;
}

export interface HslHueShift {
  red: number;
  yellow: number;
  green: number;
  cyan: number;
  blue: number;
  magenta: number;
}

export interface GradingState {
  // Primary adjustments
  exposure: number;       // -3.0 to +3.0 stops
  contrast: number;       // 0.5 to 2.0 (1.0 default)
  pivot: number;          // 0.0 to 1.0 (0.435 default DaVinci)
  temperature: number;    // -100 to +100
  tint: number;           // -100 to +100
  saturation: number;     // 0.0 to 2.5 (1.0 default)
  colorBoost: number;     // -100 to +100 (vibrance)
  
  // Dynamic range / tonal recovery
  highlights: number;     // -100 to +100
  shadows: number;        // -100 to +100
  whites: number;         // -100 to +100
  blacks: number;         // -100 to +100
  
  // DaVinci 3-Way Wheels + Offset
  lift: RGBVec;           // r, g, b offset: -0.5 to 0.5
  liftMaster: number;     // -0.5 to 0.5
  gamma: RGBVec;          // r, g, b gamma: -0.5 to 0.5
  gammaMaster: number;    // -0.5 to 0.5
  gain: RGBVec;           // r, g, b gain: 0.5 to 2.0 (1.0 default)
  gainMaster: number;     // 0.5 to 2.0 (1.0 default)
  offset: RGBVec;         // r, g, b offset: -0.5 to 0.5
  offsetMaster: number;   // -0.5 to 0.5

  // Curves
  masterCurve: CurvePoint[];
  redCurve: CurvePoint[];
  greenCurve: CurvePoint[];
  blueCurve: CurvePoint[];

  // HSL Selective adjustments
  hueVsHue: HslHueShift;
  hueVsSat: HslHueShift;
  hueVsLum: HslHueShift;

  // Split Toning / Film Look
  shadowTint: RGBVec;     // Color tint added to deep shadows
  shadowTintStrength: number; // 0 to 100
  highlightTint: RGBVec;  // Color tint added to highlights
  highlightTintStrength: number; // 0 to 100
  splitBalance: number;   // -100 to +100 (shift balance between shadows and highlights)

  // Camera Log Input Transform (Optional)
  inputSpace: 'rec709' | 'slog3' | 'logc3' | 'bmdgen5' | 'clog3' | 'panasonic_gh5' | 'panasonic_ux90' | 'sony_fx30' | 'canon_r6';

  // Target Color Space & Gamma (DaVinci Resolve Studio standard)
  targetColorSpace: 'rec709' | 'p3dci';
  targetGamma: '2.4' | '2.2' | 'rec709_scene' | 'rec709a';

  // Metadata
  lutTitle: string;
  lutCreator: string;
  lutDescription: string;
}

export type LutGridSize = 17 | 33 | 65;

export interface LutPreset {
  id: string;
  name: string;
  category: 'cinema' | 'vintage' | 'creative' | 'log_conversion' | 'monochrome' | 'wedding' | 'camera_profile';
  description: string;
  author?: string;
  previewColor: string;
  state: Partial<GradingState>;
}

export type PreviewMode = 'split' | 'side-by-side' | 'graded' | 'original';

export type ScopeMode = 'rgb_parade' | 'waveform' | 'vectorscope' | 'histogram';
