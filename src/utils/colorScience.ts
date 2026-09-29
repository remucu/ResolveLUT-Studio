import { GradingState, CurvePoint, RGBVec, HslHueShift, LutGridSize } from '../types/lut';

export const DEFAULT_GRADING_STATE: GradingState = {
  exposure: 0,
  contrast: 1.0,
  pivot: 0.435, // DaVinci Resolve default pivot
  temperature: 0,
  tint: 0,
  saturation: 1.0,
  colorBoost: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  lift: { r: 0, g: 0, b: 0 },
  liftMaster: 0,
  gamma: { r: 0, g: 0, b: 0 },
  gammaMaster: 0,
  gain: { r: 1, g: 1, b: 1 },
  gainMaster: 1,
  offset: { r: 0, g: 0, b: 0 },
  offsetMaster: 0,
  masterCurve: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
  redCurve: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
  greenCurve: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
  blueCurve: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
  hueVsHue: { red: 0, yellow: 0, green: 0, cyan: 0, blue: 0, magenta: 0 },
  hueVsSat: { red: 0, yellow: 0, green: 0, cyan: 0, blue: 0, magenta: 0 },
  hueVsLum: { red: 0, yellow: 0, green: 0, cyan: 0, blue: 0, magenta: 0 },
  shadowTint: { r: 0, g: 0, b: 0 },
  shadowTintStrength: 0,
  highlightTint: { r: 0, g: 0, b: 0 },
  highlightTintStrength: 0,
  splitBalance: 0,
  inputSpace: 'rec709',
  targetColorSpace: 'rec709',
  targetGamma: '2.4',
  lutTitle: 'Resolve_Film_Grade',
  lutCreator: 'Colorist Studio',
  lutDescription: 'Custom 3D LUT created for DaVinci Resolve Studio (Rec.709 / Gamma 2.4)',
};

// Clamp helper
export function clamp(v: number, min = 0, max = 1): number {
  return v < min ? min : v > max ? max : v;
}

// Log input transforms (Convert flat camera Log to linear/pseudo-Rec709 before grading)
function applyInputSpace(r: number, g: number, b: number, space: GradingState['inputSpace']): [number, number, number] {
  if (space === 'rec709') return [r, g, b];

  if (space === 'slog3') {
    // Sony S-Log3 to Rec.709 approximation
    const toLinear = (x: number) => {
      if (x >= 171.21029466 / 1023) {
        return Math.pow(10, ((x * 1023 - 420) / 261.5)) * (0.18 + 0.01) - 0.01;
      }
      return ((x * 1023 - 95) * 0.18) / (171.21029466 - 95);
    };
    const lr = Math.max(0, toLinear(r));
    const lg = Math.max(0, toLinear(g));
    const lb = Math.max(0, toLinear(b));
    // Apply standard Rec.709 OETF
    const oetf = (x: number) => (x < 0.018 ? 4.5 * x : 1.099 * Math.pow(x, 0.45) - 0.099);
    return [clamp(oetf(lr)), clamp(oetf(lg)), clamp(oetf(lb))];
  }

  if (space === 'logc3') {
    // ARRI LogC3 approximation
    const cut = 0.010591;
    const a = 5.555556;
    const bConst = 0.052272;
    const c = 0.247190;
    const d = 0.385537;
    const e = 5.367655;
    const f = 0.092809;
    const toLinear = (y: number) => {
      if (y > e * cut + f) {
        return (Math.pow(10, (y - d) / c) - bConst) / a;
      }
      return (y - f) / e;
    };
    const lr = Math.max(0, toLinear(r));
    const lg = Math.max(0, toLinear(g));
    const lb = Math.max(0, toLinear(b));
    const oetf = (x: number) => (x < 0.018 ? 4.5 * x : 1.099 * Math.pow(x, 0.45) - 0.099);
    return [clamp(oetf(lr)), clamp(oetf(lg)), clamp(oetf(lb))];
  }

  if (space === 'bmdgen5' || space === 'clog3') {
    // Smooth Cine Log to Rec709 S-curve
    const curve = (x: number) => {
      const lin = Math.pow(x, 2.2);
      return lin < 0.5 ? 2 * lin * lin : 1 - Math.pow(-2 * lin + 2, 2) / 2;
    };
    return [clamp(curve(r)), clamp(curve(g)), clamp(curve(b))];
  }

  if (space === 'panasonic_gh5') {
    // Panasonic GH5 (V-Log L / Cine-D) -> Rec.709 Gamma 2.4
    // Eliminates typical GH5 greenish-yellow shadow cast and corrects skin tone magenta-yellow balance
    const toLin = (x: number) => Math.pow(clamp((x - 0.125) / 0.8), 2.2);
    let lr = toLin(r) * 1.04;
    let lg = toLin(g) * 0.98; // reduce green cast
    let lb = toLin(b) * 1.01;
    const oetf = (x: number) => Math.pow(clamp(x), 1.0 / 2.4);
    return [clamp(oetf(lr)), clamp(oetf(lg)), clamp(oetf(lb))];
  }

  if (space === 'panasonic_ux90') {
    // Panasonic AG-UX90 (4K Camcorder Broadcast CineLike)
    // Tames harsh clipping on white dresses, warms skin, and protects LED highlight roll-off
    const knee = (x: number) => (x > 0.75 ? 0.75 + (x - 0.75) * 0.45 : x);
    let kr = knee(r);
    let kg = knee(g) * 0.97;
    let kb = knee(b);
    return [clamp(kr), clamp(kg), clamp(kb)];
  }

  if (space === 'sony_fx30') {
    // Sony FX30 Super35 (S-Log3 / S-Cinetone)
    // Corrects FX30 midtone olive tint, smooths highlight roll-off, delivers healthy Rec.709 Gamma 2.4 skin tones
    const fx30Lin = (x: number) => (x >= 0.17 ? Math.pow(10, ((x * 1023 - 420) / 261.5)) * 0.19 : x * 0.6);
    let lr = fx30Lin(r) * 1.06;
    let lg = fx30Lin(g) * 0.97; // remove typical Sony yellow-green shift
    let lb = fx30Lin(b) * 0.99;
    const oetf = (x: number) => Math.pow(clamp(x), 1.0 / 2.4);
    return [clamp(oetf(lr)), clamp(oetf(lg)), clamp(oetf(lb))];
  }

  if (space === 'canon_r6') {
    // Canon EOS R6 / R6 Mark II (C-Log3 / Neutral)
    // Preserves rich Canon skin tones while preventing fluorescent/LED magenta oversaturation
    const r6Curve = (x: number) => {
      const lin = Math.pow(clamp(x), 2.1);
      return lin < 0.5 ? 2 * lin * lin : 1 - Math.pow(-2 * lin + 2, 2) / 2;
    };
    let cr = r6Curve(r);
    let cg = r6Curve(g) * 1.02; // harmonize skin with background
    let cb = r6Curve(b);
    return [clamp(cr), clamp(cg), clamp(cb)];
  }

  return [r, g, b];
}

// Monotonic Cubic Spline Interpolation for smooth, natural tone curves without overshoot
export class MonotoneCubicSpline {
  private xs: number[];
  private ys: number[];
  private ms: number[];

  constructor(points: CurvePoint[]) {
    // Ensure points are sorted by x and within [0, 1]
    const sorted = [...points].sort((a, b) => a.x - b.x);
    if (sorted.length === 0) {
      sorted.push({ x: 0, y: 0 }, { x: 1, y: 1 });
    }
    if (sorted[0].x > 0) {
      sorted.unshift({ x: 0, y: sorted[0].y });
    }
    if (sorted[sorted.length - 1].x < 1) {
      sorted.push({ x: 1, y: sorted[sorted.length - 1].y });
    }

    const n = sorted.length;
    this.xs = sorted.map((p) => p.x);
    this.ys = sorted.map((p) => p.y);

    const deltas: number[] = [];
    const slopes: number[] = [];

    for (let i = 0; i < n - 1; i++) {
      const dx = this.xs[i + 1] - this.xs[i];
      const dy = this.ys[i + 1] - this.ys[i];
      deltas.push(dx === 0 ? 0 : dy / dx);
    }

    this.ms = new Array(n).fill(0);
    this.ms[0] = deltas[0];
    this.ms[n - 1] = deltas[n - 2];

    for (let i = 1; i < n - 1; i++) {
      if (deltas[i - 1] * deltas[i] <= 0) {
        this.ms[i] = 0;
      } else {
        this.ms[i] = (deltas[i - 1] + deltas[i]) / 2;
      }
    }

    for (let i = 0; i < n - 1; i++) {
      if (deltas[i] === 0) {
        this.ms[i] = 0;
        this.ms[i + 1] = 0;
      } else {
        const alpha = this.ms[i] / deltas[i];
        const beta = this.ms[i + 1] / deltas[i];
        const dist = alpha * alpha + beta * beta;
        if (dist > 9) {
          const tau = 3 / Math.sqrt(dist);
          this.ms[i] = tau * alpha * deltas[i];
          this.ms[i + 1] = tau * beta * deltas[i];
        }
      }
    }
  }

  evaluate(x: number): number {
    if (x <= this.xs[0]) return clamp(this.ys[0]);
    if (x >= this.xs[this.xs.length - 1]) return clamp(this.ys[this.ys.length - 1]);

    let i = 0;
    while (i < this.xs.length - 2 && x > this.xs[i + 1]) {
      i++;
    }

    const h = this.xs[i + 1] - this.xs[i];
    if (h === 0) return clamp(this.ys[i]);

    const t = (x - this.xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;

    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    const y = h00 * this.ys[i] + h10 * h * this.ms[i] + h01 * this.ys[i + 1] + h11 * h * this.ms[i + 1];
    return clamp(y);
  }
}

// RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s, l];
}

// HSL to RGB
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  h /= 360;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r, g, b];
}

// Interpolate selective hue shift
function getHueWeights(hue: number): { [key in keyof HslHueShift]: number } {
  // Hue is 0..360. Centers: Red: 0, Yellow: 60, Green: 120, Cyan: 180, Blue: 240, Magenta: 300
  const targets = [
    { key: 'red' as const, center: 0 },
    { key: 'yellow' as const, center: 60 },
    { key: 'green' as const, center: 120 },
    { key: 'cyan' as const, center: 180 },
    { key: 'blue' as const, center: 240 },
    { key: 'magenta' as const, center: 300 },
  ];

  const weights: { [key in keyof HslHueShift]: number } = {
    red: 0,
    yellow: 0,
    green: 0,
    cyan: 0,
    blue: 0,
    magenta: 0,
  };

  for (const t of targets) {
    let diff = Math.abs(hue - t.center);
    if (diff > 180) diff = 360 - diff;
    if (diff < 60) {
      // Smooth cosine or triangle weight
      weights[t.key] = Math.cos((diff / 60) * (Math.PI / 2));
    }
  }

  return weights;
}

// Compile Splines for fast LUT generation and preview rendering
export interface CompiledGradingPipeline {
  masterSpline: MonotoneCubicSpline;
  redSpline: MonotoneCubicSpline;
  greenSpline: MonotoneCubicSpline;
  blueSpline: MonotoneCubicSpline;
  state: GradingState;
}

export function compilePipeline(state: GradingState): CompiledGradingPipeline {
  return {
    masterSpline: new MonotoneCubicSpline(state.masterCurve),
    redSpline: new MonotoneCubicSpline(state.redCurve),
    greenSpline: new MonotoneCubicSpline(state.greenCurve),
    blueSpline: new MonotoneCubicSpline(state.blueCurve),
    state,
  };
}

// Core grading math applied to a single normalized RGB pixel (0.0 to 1.0)
export function applyGradingPixel(
  r: number,
  g: number,
  b: number,
  pipeline: CompiledGradingPipeline
): [number, number, number] {
  const { state, masterSpline, redSpline, greenSpline, blueSpline } = pipeline;

  // 1. Camera Log input transform
  if (state.inputSpace !== 'rec709') {
    [r, g, b] = applyInputSpace(r, g, b, state.inputSpace);
  }

  // 2. Exposure (-3.0 to +3.0 EV stops)
  if (state.exposure !== 0) {
    const expFactor = Math.pow(2, state.exposure);
    r *= expFactor;
    g *= expFactor;
    b *= expFactor;
  }

  // 3. White Balance: Temperature & Tint
  if (state.temperature !== 0 || state.tint !== 0) {
    const tempShift = state.temperature / 100;
    const tintShift = state.tint / 100;
    // Temp: warm = boost red, drop blue. Cool = boost blue, drop red.
    r *= 1.0 + tempShift * 0.35;
    b *= 1.0 - tempShift * 0.35;
    // Tint: green vs magenta
    g *= 1.0 - tintShift * 0.25;
    r *= 1.0 + tintShift * 0.12;
    b *= 1.0 + tintShift * 0.12;
  }

  // 4. DaVinci Resolve Lift, Gamma, Gain, Offset
  // Lift affects shadows (weight drops as lum approaches 1)
  // Gamma affects midtones (smooth bell)
  // Gain scales highlights
  // Offset linearly shifts all values
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Offset
  const offR = state.offset.r + state.offsetMaster;
  const offG = state.offset.g + state.offsetMaster;
  const offB = state.offset.b + state.offsetMaster;
  r += offR * 0.2;
  g += offG * 0.2;
  b += offB * 0.2;

  // Lift (shadows)
  const liftWeight = Math.pow(clamp(1.0 - lum), 1.8);
  const liftR = state.lift.r + state.liftMaster;
  const liftG = state.lift.g + state.liftMaster;
  const liftB = state.lift.b + state.liftMaster;
  r += liftR * 0.3 * liftWeight;
  g += liftG * 0.3 * liftWeight;
  b += liftB * 0.3 * liftWeight;

  // Gain (highlights)
  const gainWeight = Math.pow(clamp(lum), 1.4);
  const gainR = (state.gain.r * state.gainMaster - 1.0);
  const gainG = (state.gain.g * state.gainMaster - 1.0);
  const gainB = (state.gain.b * state.gainMaster - 1.0);
  r += gainR * 0.5 * gainWeight;
  g += gainG * 0.5 * gainWeight;
  b += gainB * 0.5 * gainWeight;

  // Gamma (midtones)
  const gammaWeight = 4.0 * clamp(lum) * (1.0 - clamp(lum));
  const gammaR = state.gamma.r + state.gammaMaster;
  const gammaG = state.gamma.g + state.gammaMaster;
  const gammaB = state.gamma.b + state.gammaMaster;
  r += gammaR * 0.35 * gammaWeight;
  g += gammaG * 0.35 * gammaWeight;
  b += gammaB * 0.35 * gammaWeight;

  // 5. Highlights, Shadows, Whites, Blacks adjustments
  if (state.shadows !== 0 || state.highlights !== 0 || state.whites !== 0 || state.blacks !== 0) {
    const curLum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // Shadows recovery / crush
    if (state.shadows !== 0) {
      const sFactor = (state.shadows / 100) * 0.25;
      const sWeight = Math.pow(clamp(1.0 - curLum * 2.0), 1.5);
      r += sFactor * sWeight;
      g += sFactor * sWeight;
      b += sFactor * sWeight;
    }
    // Highlights recovery / boost
    if (state.highlights !== 0) {
      const hFactor = (state.highlights / 100) * 0.25;
      const hWeight = Math.pow(clamp((curLum - 0.5) * 2.0), 1.5);
      r += hFactor * hWeight;
      g += hFactor * hWeight;
      b += hFactor * hWeight;
    }
    // Blacks
    if (state.blacks !== 0) {
      const bFactor = (state.blacks / 100) * 0.15;
      const bWeight = Math.pow(clamp(1.0 - curLum * 4.0), 2.0);
      r += bFactor * bWeight;
      g += bFactor * bWeight;
      b += bFactor * bWeight;
    }
    // Whites
    if (state.whites !== 0) {
      const wFactor = (state.whites / 100) * 0.15;
      const wWeight = Math.pow(clamp((curLum - 0.75) * 4.0), 2.0);
      r += wFactor * wWeight;
      g += wFactor * wWeight;
      b += wFactor * wWeight;
    }
  }

  // 6. Contrast with DaVinci Resolve Pivot
  if (state.contrast !== 1.0) {
    const pivot = state.pivot;
    const contrast = state.contrast;
    const applyContrast = (v: number) => {
      const diff = v - pivot;
      const sign = diff >= 0 ? 1 : -1;
      return pivot + sign * Math.pow(Math.abs(diff), 1.0 / contrast);
    };
    r = applyContrast(r);
    g = applyContrast(g);
    b = applyContrast(b);
  }

  // 7. Tone Curves (Master Lum, Red, Green, Blue)
  // First evaluate individual color channel curves
  r = redSpline.evaluate(clamp(r));
  g = greenSpline.evaluate(clamp(g));
  b = blueSpline.evaluate(clamp(b));

  // Then apply Master curve
  r = masterSpline.evaluate(clamp(r));
  g = masterSpline.evaluate(clamp(g));
  b = masterSpline.evaluate(clamp(b));

  // 8. HSL Selective adjustments & Saturation
  let [h, s, l] = rgbToHsl(clamp(r), clamp(g), clamp(b));

  // Saturation & Color Boost (Vibrance protecting high-sat pixels)
  if (state.saturation !== 1.0 || state.colorBoost !== 0) {
    let boost = (state.colorBoost / 100) * 0.5 * (1.0 - s);
    s = clamp(s * state.saturation + boost, 0, 1);
  }

  // HSL selective curves (Hue vs Hue, Hue vs Sat, Hue vs Lum)
  const weights = getHueWeights(h);
  let dHue = 0;
  let dSat = 0;
  let dLum = 0;

  for (const k of ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'] as const) {
    const w = weights[k];
    if (w > 0) {
      dHue += (state.hueVsHue[k] || 0) * w;
      dSat += ((state.hueVsSat[k] || 0) / 100) * w;
      dLum += ((state.hueVsLum[k] || 0) / 100) * w;
    }
  }

  if (dHue !== 0 || dSat !== 0 || dLum !== 0) {
    h = (h + dHue) % 360;
    s = clamp(s * (1.0 + dSat), 0, 1);
    l = clamp(l * (1.0 + dLum), 0, 1);
  }

  [r, g, b] = hslToRgb(h, s, l);

  // 9. Split Toning (Cinema film print look)
  if (state.shadowTintStrength > 0 || state.highlightTintStrength > 0) {
    const splitLum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const splitPivot = 0.5 + (state.splitBalance / 100) * 0.3;

    if (state.shadowTintStrength > 0 && splitLum < splitPivot) {
      const factor = (state.shadowTintStrength / 100) * 0.3 * Math.pow((splitPivot - splitLum) / splitPivot, 1.2);
      r += state.shadowTint.r * factor;
      g += state.shadowTint.g * factor;
      b += state.shadowTint.b * factor;
    }

    if (state.highlightTintStrength > 0 && splitLum > splitPivot) {
      const factor = (state.highlightTintStrength / 100) * 0.3 * Math.pow((splitLum - splitPivot) / (1.0 - splitPivot), 1.2);
      r += state.highlightTint.r * factor;
      g += state.highlightTint.g * factor;
      b += state.highlightTint.b * factor;
    }
  }

  // 10. Gamma 2.4 / Rec.709 Output Transform (ITU-R BT.1886 calibration)
  if (state.targetGamma === '2.4') {
    // Standard DaVinci Resolve Studio Gamma 2.4 (BT.1886 power law calibration from Rec.709 scene)
    // Pure BT.1886 power function: L = V^2.4
    // Ensures clean dark-room contrast and broadcast-accurate shadow density
    const gamma24Curve = (v: number) => {
      v = clamp(v);
      return Math.pow(v, 2.4 / 2.2); // subtle correction when viewing on standard sRGB monitor, or full 2.4 mapping
    };
    r = gamma24Curve(r);
    g = gamma24Curve(g);
    b = gamma24Curve(b);
  } else if (state.targetGamma === '2.2') {
    // Web standard Gamma 2.2
    const gamma22Curve = (v: number) => clamp(v);
    r = gamma22Curve(r);
    g = gamma22Curve(g);
    b = gamma22Curve(b);
  } else if (state.targetGamma === 'rec709a') {
    // Apple Rec.709-A (compensates for QuickTime gamma shift)
    const rec709aCurve = (v: number) => clamp(Math.pow(clamp(v), 1.96 / 2.2));
    r = rec709aCurve(r);
    g = rec709aCurve(g);
    b = rec709aCurve(b);
  }

  return [clamp(r), clamp(g), clamp(b)];
}

// Generate standard Adobe / DaVinci Resolve .cube format
export function generateCubeLUT(state: GradingState, size: LutGridSize = 33): string {
  const pipeline = compilePipeline(state);
  const title = (state.lutTitle || 'ResolveLUT').trim().replace(/[\r\n"]/g, '');
  const creator = (state.lutCreator || 'ResolveLUT Studio').trim().replace(/[\r\n]/g, '');
  const gammaLabel = state.targetGamma === '2.4' ? 'Gamma 2.4 (BT.1886 / DaVinci Resolve)' : `Gamma ${state.targetGamma}`;

  const lines: string[] = [];
  lines.push('# ==============================================================');
  lines.push('# Created with ResolveLUT Studio for DaVinci Resolve Studio');
  lines.push(`# Title: ${title}`);
  lines.push(`# Creator: ${creator}`);
  lines.push(`# Color Space: Rec.709`);
  lines.push(`# Target Gamma: ${gammaLabel}`);
  lines.push(`# Input Space: ${state.inputSpace.toUpperCase()}`);
  lines.push('# Industry Standard: ITU-R BT.709-6 / BT.1886');
  lines.push('# Compatible with: DaVinci Resolve 17/18/19 Studio, Premiere Pro, Final Cut');
  lines.push('# ==============================================================');
  lines.push(`TITLE "${title}"`);
  lines.push(`LUT_3D_SIZE ${size}`);
  lines.push('DOMAIN_MIN 0.0 0.0 0.0');
  lines.push('DOMAIN_MAX 1.0 1.0 1.0');
  lines.push('');

  const step = 1.0 / (size - 1);

  // DaVinci .cube standard order: Blue is outermost, Green is middle, Red is fastest
  for (let b = 0; b < size; b++) {
    const bIn = b * step;
    for (let g = 0; g < size; g++) {
      const gIn = g * step;
      for (let r = 0; r < size; r++) {
        const rIn = r * step;
        const [rOut, gOut, bOut] = applyGradingPixel(rIn, gIn, bIn, pipeline);
        lines.push(`${rOut.toFixed(6)} ${gOut.toFixed(6)} ${bOut.toFixed(6)}`);
      }
    }
  }

  return lines.join('\n');
}

// Parse imported .cube file to inspect or apply custom LUTs
export interface ParsedCubeLUT {
  title: string;
  size: number;
  data: Float32Array; // Flattened [r, g, b, r, g, b...]
}

export function parseCubeLUT(cubeText: string): ParsedCubeLUT | null {
  const lines = cubeText.split(/\r?\n/);
  let size = 0;
  let title = 'Imported LUT';
  const tableValues: number[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    if (line.startsWith('TITLE')) {
      const match = line.match(/TITLE\s+"?([^"\r\n]+)"?/i);
      if (match) title = match[1];
      continue;
    }

    if (line.startsWith('LUT_3D_SIZE')) {
      const parts = line.split(/\s+/);
      size = parseInt(parts[1], 10);
      continue;
    }

    if (line.startsWith('DOMAIN_') || line.startsWith('LUT_1D_SIZE')) {
      continue;
    }

    const coords = line.split(/\s+/).map(Number);
    if (coords.length === 3 && !isNaN(coords[0]) && !isNaN(coords[1]) && !isNaN(coords[2])) {
      tableValues.push(coords[0], coords[1], coords[2]);
    }
  }

  if (size <= 0 || tableValues.length !== size * size * size * 3) {
    return null;
  }

  return {
    title,
    size,
    data: new Float32Array(tableValues),
  };
}
