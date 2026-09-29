import React, { useState } from 'react';
import { BASIC_STARTER_LUTS, CINEMA_PRESETS, applyPresetToState } from '../utils/presets';
import { GradingState, LutPreset } from '../types/lut';
import { generateCubeLUT } from '../utils/colorScience';
import { Download, Sliders, Check, Wand2, Sparkles, FolderDown, ArrowRight, RotateCcw, ChevronDown, Layers } from 'lucide-react';

interface QuickStarterLutsProps {
  currentState: GradingState;
  onApplyPreset: (newState: GradingState) => void;
  onNavigateToGrading: () => void;
  onOpenTransmit?: () => void;
}

export const QuickStarterLuts: React.FC<QuickStarterLutsProps> = ({
  currentState,
  onApplyPreset,
  onNavigateToGrading,
  onOpenTransmit,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basic' | 'wedding' | 'camera_profile' | 'cinema'>('wedding');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCustomGeneratorOpen, setIsCustomGeneratorOpen] = useState<boolean>(true);
  const [isPresetsGridOpen, setIsPresetsGridOpen] = useState<boolean>(true);

  // Quick custom builder state (6 options total)
  const [quickContrast, setQuickContrast] = useState<number>(25); // 1. Contrast (-40 to +60)
  const [quickTemp, setQuickTemp] = useState<number>(0); // 2. Temperature (-50 to +50)
  const [quickTint, setQuickTint] = useState<number>(0); // 3. Tint (-50 to +50)
  const [quickSaturation, setQuickSaturation] = useState<number>(10); // 4. Saturation (-50 to +60)
  const [quickHighlights, setQuickHighlights] = useState<number>(-12); // 5. Highlights roll-off (-50 to +30)
  const [quickShadows, setQuickShadows] = useState<number>(4); // 6. Shadows lift (-40 to +50)
  const [quickLook, setQuickLook] = useState<
    | 'wedding_nature'
    | 'wedding_led'
    | 'wedding_arch'
    | 'teal_orange'
    | 'kodak_2383'
    | 'fuji_eterna'
    | 'punchy'
    | 'vintage'
    | 'sepia'
    | 'bleach'
    | 'moody'
    | 'mono_noir'
    | 'neutral'
  >('wedding_nature');

  const handleResetQuickParams = () => {
    setQuickContrast(25);
    setQuickTemp(0);
    setQuickTint(0);
    setQuickSaturation(10);
    setQuickHighlights(-12);
    setQuickShadows(4);
  };

  const filteredPresets = selectedCategory === 'all'
    ? CINEMA_PRESETS
    : selectedCategory === 'basic'
    ? BASIC_STARTER_LUTS
    : CINEMA_PRESETS.filter((p) => p.category === selectedCategory);

  // Direct 1-click download of any preset as .cube
  const handleDirectDownload = (preset: LutPreset) => {
    setDownloadingId(preset.id);
    const stateForPreset = applyPresetToState(currentState, preset);
    const cubeContent = generateCubeLUT(stateForPreset, 33);

    const blob = new Blob([cubeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `${preset.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_Resolve33.cube`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setDownloadingId(null);
    }, 1200);
  };

  // Bulk download all basic starter LUTs
  const handleBulkDownload = () => {
    BASIC_STARTER_LUTS.forEach((preset, index) => {
      setTimeout(() => {
        const stateForPreset = applyPresetToState(currentState, preset);
        const cubeContent = generateCubeLUT(stateForPreset, 33);
        const blob = new Blob([cubeContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ResolveLUT_${preset.id}.cube`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, index * 250);
    });
  };

  // Apply custom quick generator with 13 rich aesthetic styles
  const handleGenerateCustomStarter = () => {
    const newState: GradingState = {
      ...currentState,
      lutTitle: `Custom_${quickLook}`,
      contrast: 1.0 + quickContrast / 100,
      temperature: quickTemp,
    };

    switch (quickLook) {
      case 'wedding_nature':
        newState.highlights = -18;
        newState.whites = -5;
        newState.shadows = 6;
        newState.blacks = 2;
        newState.colorBoost = 14;
        newState.saturation = 1.06;
        newState.gain = { r: 1.05, g: 1.02, b: 0.96 };
        newState.gamma = { r: 0.02, g: 0.01, b: -0.02 };
        newState.hueVsHue = { red: 2, yellow: -4, green: 14, cyan: -4, blue: 0, magenta: 0 };
        newState.hueVsSat = { red: 8, yellow: 6, green: -28, cyan: -10, blue: -5, magenta: -5 };
        newState.masterCurve = [
          { x: 0, y: 0.02 },
          { x: 0.25, y: 0.23 },
          { x: 0.75, y: 0.78 },
          { x: 1, y: 0.97 },
        ];
        break;

      case 'wedding_led':
        newState.highlights = -24;
        newState.whites = -8;
        newState.shadows = -10;
        newState.blacks = -4;
        newState.saturation = 1.04;
        newState.colorBoost = 10;
        newState.gamma = { r: 0.04, g: 0.01, b: -0.03 };
        newState.gain = { r: 1.02, g: 0.98, b: 0.94 };
        newState.hueVsSat = { red: 4, yellow: 8, green: -15, cyan: -20, blue: -25, magenta: -35 };
        newState.shadowTint = { r: -0.08, g: 0.02, b: 0.12 };
        newState.shadowTintStrength = 18;
        break;

      case 'wedding_arch':
        newState.highlights = -14;
        newState.whites = -2;
        newState.shadows = -4;
        newState.blacks = -2;
        newState.saturation = 1.08;
        newState.colorBoost = 12;
        newState.gain = { r: 1.08, g: 1.03, b: 0.92 };
        newState.gamma = { r: 0.03, g: -0.01, b: -0.03 };
        newState.shadowTint = { r: 0.14, g: 0.08, b: -0.04 };
        newState.shadowTintStrength = 25;
        newState.highlightTint = { r: 0.18, g: 0.12, b: -0.06 };
        newState.highlightTintStrength = 18;
        break;

      case 'teal_orange':
        newState.highlights = 4;
        newState.shadows = -12;
        newState.blacks = -6;
        newState.saturation = 1.22;
        newState.colorBoost = 18;
        newState.lift = { r: -0.15, g: 0.02, b: 0.22 };
        newState.gain = { r: 1.15, g: 1.02, b: 0.84 };
        newState.shadowTint = { r: -0.3, g: 0.1, b: 0.4 };
        newState.shadowTintStrength = 42;
        newState.highlightTint = { r: 0.35, g: 0.15, b: -0.2 };
        newState.highlightTintStrength = 32;
        newState.hueVsSat = { red: 20, yellow: 15, green: -25, cyan: 30, blue: 25, magenta: -20 };
        break;

      case 'kodak_2383':
        newState.highlights = -14;
        newState.shadows = -10;
        newState.blacks = -4;
        newState.saturation = 1.15;
        newState.colorBoost = 12;
        newState.lift = { r: -0.06, g: 0.02, b: 0.08 };
        newState.gamma = { r: 0.04, g: -0.01, b: -0.05 };
        newState.gain = { r: 1.08, g: 1.02, b: 0.92 };
        newState.shadowTint = { r: -0.2, g: 0.05, b: 0.3 };
        newState.shadowTintStrength = 35;
        newState.highlightTint = { r: 0.25, g: 0.12, b: -0.15 };
        newState.highlightTintStrength = 25;
        break;

      case 'fuji_eterna':
        newState.contrast = Math.max(0.7, 0.94 + quickContrast / 100);
        newState.saturation = 0.88;
        newState.colorBoost = -5;
        newState.shadows = 14;
        newState.highlights = -12;
        newState.gain = { r: 0.97, g: 1.02, b: 1.0 };
        newState.hueVsSat = { red: -8, yellow: -12, green: 5, cyan: 10, blue: -10, magenta: -15 };
        break;

      case 'punchy':
        newState.contrast = Math.max(1.1, 1.35 + quickContrast / 100);
        newState.colorBoost = 15;
        newState.shadows = -14;
        newState.highlights = -8;
        newState.blacks = -6;
        newState.whites = 4;
        newState.masterCurve = [
          { x: 0, y: 0.01 },
          { x: 0.22, y: 0.14 },
          { x: 0.5, y: 0.5 },
          { x: 0.78, y: 0.86 },
          { x: 1, y: 0.99 },
        ];
        break;

      case 'vintage':
        newState.blacks = 10;
        newState.shadows = 12;
        newState.highlights = -14;
        newState.saturation = 1.1;
        newState.colorBoost = 10;
        newState.lift = { r: 0.04, g: 0.03, b: -0.02 };
        newState.liftMaster = 0.04;
        newState.gain = { r: 1.06, g: 1.04, b: 0.92 };
        newState.shadowTint = { r: 0.1, g: 0.12, b: -0.05 };
        newState.shadowTintStrength = 25;
        break;

      case 'sepia':
        newState.saturation = 0.05;
        newState.colorBoost = -90;
        newState.shadows = 6;
        newState.blacks = 4;
        newState.shadowTint = { r: 0.26, g: 0.14, b: -0.05 };
        newState.shadowTintStrength = 55;
        newState.highlightTint = { r: 0.32, g: 0.22, b: 0.04 };
        newState.highlightTintStrength = 45;
        break;

      case 'bleach':
        newState.contrast = Math.max(1.2, 1.48 + quickContrast / 100);
        newState.saturation = 0.52;
        newState.colorBoost = -25;
        newState.shadows = -20;
        newState.highlights = 16;
        newState.blacks = -12;
        newState.whites = 10;
        newState.gainMaster = 1.08;
        break;

      case 'moody':
        newState.contrast = 1.25;
        newState.saturation = 0.88;
        newState.colorBoost = -5;
        newState.shadows = -16;
        newState.highlights = -10;
        newState.blacks = 6; // matte blacks
        newState.shadowTint = { r: -0.05, g: 0.03, b: 0.08 };
        newState.shadowTintStrength = 22;
        break;

      case 'mono_noir':
        newState.saturation = 0.0;
        newState.colorBoost = -100;
        newState.contrast = 1.28;
        newState.shadows = -8;
        newState.highlights = -10;
        newState.blacks = -4;
        newState.whites = 6;
        break;

      case 'neutral':
      default:
        // Clean neutral grade
        newState.saturation = 1.0;
        newState.colorBoost = 0;
        break;
    }

    // Apply the 6 custom generator options as user overrides
    newState.contrast = 1.0 + quickContrast / 100;
    newState.temperature = quickTemp;
    newState.tint = quickTint;
    if (quickLook !== 'mono_noir') {
      newState.saturation = Math.max(0, (newState.saturation || 1.0) * (1.0 + quickSaturation / 100));
    }
    newState.highlights = quickHighlights;
    newState.shadows = quickShadows;

    onApplyPreset(newState);
    onNavigateToGrading();
  };

  const handleTransmitCustomStarter = () => {
    handleGenerateCustomStarter();
    if (onOpenTransmit) {
      onOpenTransmit();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Top Banner / Feature Callout */}
      <div className="bg-gradient-to-r from-[#171b24] via-[#1c2230] to-[#151922] p-6 rounded-xl border border-[#2a3448] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-mono text-xs font-semibold uppercase tracking-wider">
              Generare Automată LUT-uri DaVinci Resolve
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-300 font-mono text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Rec.709 · Gamma 2.4 (BT.1886)
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Puncte de Pornire Predefinite pentru DaVinci Resolve Studio (Rec.709 / Gamma 2.4)
          </h2>
          <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
            Selectează unul dintre LUT-urile de bază de mai jos (creștere contrast, balans de alb cald sau rece, efect sepia sau stil vintage). Îl poți încărca direct în suita de colorizare pentru a-l ajusta fin cu roțile de culoare și curbele RGB, sau îl poți descărca imediat ca fișier <code className="font-mono text-amber-300 text-xs bg-amber-950/40 px-1 py-0.5 rounded">.cube</code> gata de importat în DaVinci Resolve.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleBulkDownload}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#253043] hover:bg-[#313e56] text-white text-xs font-medium rounded-lg border border-[#3c4c6a] transition-all hover:scale-[1.02] shadow-md"
          >
            <FolderDown className="w-4 h-4 text-amber-400" />
            <span>Descarcă Pachetul de Bază (5 LUT-uri)</span>
          </button>
        </div>
      </div>

      {/* Accordion 1: Colecție Preseturi LUT */}
      <div className="bg-[#131722] rounded-xl border border-[#232938] overflow-hidden transition-all">
        <button
          onClick={() => setIsPresetsGridOpen(!isPresetsGridOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#181e2c] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center border border-amber-500/30">
              1
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Rubrica 1: Colecție Preseturi Predefinite & Profiluri Cameră
                </h3>
                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/20 font-semibold">
                  {filteredPresets.length} LUT-uri Active
                </span>
              </div>
              {!isPresetsGridOpen && (
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Filtru: {selectedCategory.toUpperCase()} | Calibrate Rec.709 Gamma 2.4
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {isPresetsGridOpen ? 'Restrânge' : 'Desfășoară'}
            </span>
            <div className={`p-1 rounded-md bg-[#1f2736] text-slate-300 transition-transform duration-200 ${isPresetsGridOpen ? 'rotate-180 text-amber-400' : ''}`}>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>

        {isPresetsGridOpen && (
          <div className="p-4 pt-2 border-t border-[#212735] space-y-4 animate-in fade-in duration-150">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#232936] pb-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#12161f] rounded-lg border border-[#212836]">
          <button
            onClick={() => setSelectedCategory('wedding')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedCategory === 'wedding'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nuntă (Natură / Sală LED / Arhitecturale)
          </button>
          <button
            onClick={() => setSelectedCategory('camera_profile')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedCategory === 'camera_profile'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Camere Nuntă (GH5 / UX90 / FX30 / R6)
          </button>
          <button
            onClick={() => setSelectedCategory('basic')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedCategory === 'basic'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            LUT-uri de Bază
          </button>
          <button
            onClick={() => setSelectedCategory('cinema')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedCategory === 'cinema'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Peliculă Cinema
          </button>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedCategory === 'all'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Toate ({CINEMA_PRESETS.length})
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Standard DaVinci Resolve: <span className="text-slate-200">Rec.709 Gamma 2.4 · 33 Mesh</span>
        </div>
      </div>

      {/* Predefined LUT Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPresets.map((preset) => {
          const isCurrentTitle = currentState.lutTitle === (preset.state.lutTitle || preset.name);
          const isDownloading = downloadingId === preset.id;

          return (
            <div
              key={preset.id}
              className={`bg-[#151922] rounded-xl border p-5 flex flex-col justify-between transition-all hover:border-[#3d4b64] hover:shadow-lg ${
                isCurrentTitle ? 'border-amber-500/60 ring-1 ring-amber-500/30' : 'border-[#222938]'
              }`}
            >
              <div className="space-y-3">
                {/* Header row with color badge & category */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full ring-2 ring-white/10 shrink-0"
                      style={{ backgroundColor: preset.previewColor }}
                    />
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                      {preset.category}
                    </span>
                  </div>
                  {isCurrentTitle && (
                    <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Activ în editor
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    {preset.name}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed line-clamp-3">
                    {preset.description}
                  </p>
                </div>

                {/* Specific technical parameters summary */}
                <div className="pt-2 border-t border-[#1e2533] grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                  <div>
                    Contrast: <span className="text-slate-200">{preset.state.contrast?.toFixed(2) || '1.00'}</span>
                  </div>
                  <div>
                    Temp: <span className="text-slate-200">{preset.state.temperature ? `${preset.state.temperature > 0 ? '+' : ''}${preset.state.temperature}` : '0'}</span>
                  </div>
                  <div>
                    Saturație: <span className="text-slate-200">{preset.state.saturation?.toFixed(2) || '1.00'}</span>
                  </div>
                  <div>
                    Gamă Țintă: <span className="text-amber-400 font-semibold">Rec.709 G2.4</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4 mt-4 border-t border-[#1e2533]">
                <button
                  onClick={() => {
                    const newState = applyPresetToState(currentState, preset);
                    onApplyPreset(newState);
                    onNavigateToGrading();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#202736] hover:bg-[#2b3548] text-white text-xs font-medium rounded-lg transition-colors border border-[#2d374a]"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Personalizează</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>

                <button
                  onClick={() => handleDirectDownload(preset)}
                  disabled={isDownloading}
                  title="Descarcă direct fișierul .cube"
                  className="flex items-center justify-center p-2 bg-[#1b2230] hover:bg-emerald-600 hover:text-white text-slate-300 rounded-lg border border-[#2a3448] transition-colors"
                >
                  {isDownloading ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}
</div>

      {/* Accordion 2: Generator Rapid de LUT Personalizat */}
      <div className="bg-[#131722] rounded-xl border border-[#273042] overflow-hidden transition-all">
        <button
          onClick={() => setIsCustomGeneratorOpen(!isCustomGeneratorOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#181e2c] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-mono font-bold text-xs flex items-center justify-center border border-rose-500/30">
              2
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Rubrica 2: Generator Rapid de LUT Personalizat (Cei 6 Parametri de Calibrare)
                </h3>
                <span className="bg-rose-500/10 text-rose-400 text-[10px] font-mono px-2 py-0.5 rounded border border-rose-500/20 font-semibold">
                  6 Glisoare + 13 Stiluri
                </span>
              </div>
              {!isCustomGeneratorOpen && (
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Contrast: {quickContrast}% | Temp: {quickTemp} | Tint: {quickTint} | Sat: {quickSaturation}% | High: {quickHighlights} | Shd: {quickShadows}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {isCustomGeneratorOpen ? 'Restrânge' : 'Desfășoară'}
            </span>
            <div className={`p-1 rounded-md bg-[#1f2736] text-slate-300 transition-transform duration-200 ${isCustomGeneratorOpen ? 'rotate-180 text-rose-400' : ''}`}>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>

        {isCustomGeneratorOpen && (
          <div className="p-6 pt-2 border-t border-[#222a3a] space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222a3a] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">
                    Configurare Rapidă Stil Personalizat
                  </h4>
                </div>
                <p className="text-xs text-slate-400">
                  Configurează cei <strong>6 parametri esențiali de calibrare</strong> (Contrast, Balans Temperatură, Tentă Tint, Saturație, Recuperare Lumini și Deschidere Umbre) și generează instantaneu profilul în DaVinci Resolve.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleResetQuickParams}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#1b2230] hover:bg-[#253043] text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-[#2c374d] transition-colors"
                  title="Resetează toate cele 6 opțiuni la valorile recomandate"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Resetează 6 Opțiuni</span>
                </button>
                <button
                  onClick={handleGenerateCustomStarter}
                  className="flex items-center gap-2 px-3.5 py-2 bg-[#1b2230] hover:bg-[#253043] text-slate-200 hover:text-white text-xs font-medium rounded-lg border border-[#2c374d] transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aplică în Colorist</span>
                </button>
                {onOpenTransmit && (
                  <button
                    onClick={handleTransmitCustomStarter}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-600 text-white text-xs font-semibold rounded-lg hover:from-sky-400 hover:to-rose-500 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    title="Configurează direct arborele de noduri din DaVinci Resolve conform valorilor LUT-ului"
                  >
                    <Layers className="w-3.5 h-3.5 text-sky-200" />
                    <span>Transmite în Noduri DaVinci</span>
                  </button>
                )}
              </div>
            </div>

        {/* 6 Calibration Options Grid (2 rows x 3 columns) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">
              Cei 6 Parametri de Calibrare Rapidă:
            </span>
            <span className="font-mono text-amber-400 text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              6 Opțiuni Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Opțiunea 1: Contrast Slider */}
            <div className="space-y-2 bg-[#19202c] p-4 rounded-lg border border-[#252f42] relative">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center">1</span>
                  Ajustare Contrast
                </span>
                <span className="font-mono text-amber-400 tabular-nums font-bold">
                  {quickContrast > 0 ? `+${quickContrast}` : quickContrast}%
                </span>
              </div>
              <input
                type="range"
                min="-40"
                max="60"
                value={quickContrast}
                onChange={(e) => setQuickContrast(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-[#2c374b] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Moale / Plat (-40%)</span>
                <span>Standard (0%)</span>
                <span>Punchy S-Curve (+60%)</span>
              </div>
            </div>

            {/* Opțiunea 2: Temperature Slider */}
            <div className="space-y-2 bg-[#19202c] p-4 rounded-lg border border-[#252f42] relative">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center">2</span>
                  Balans de Alb (Temp)
                </span>
                <span className="font-mono text-amber-400 tabular-nums font-bold">
                  {quickTemp > 0 ? `+${quickTemp} Cald` : quickTemp < 0 ? `${quickTemp} Rece` : '0 Neutru'}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={quickTemp}
                onChange={(e) => setQuickTemp(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-[#2c374b] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Albastru Rece (-50)</span>
                <span>Neutru (0)</span>
                <span>Auriu Cald (+50)</span>
              </div>
            </div>

            {/* Opțiunea 3: Tint (Verde / Magenta) Slider */}
            <div className="space-y-2 bg-[#19202c] p-4 rounded-lg border border-[#252f42] relative">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center">3</span>
                  Tentă Cromatică (Tint)
                </span>
                <span className="font-mono text-amber-400 tabular-nums font-bold">
                  {quickTint > 0 ? `+${quickTint} Magenta` : quickTint < 0 ? `${quickTint} Verde` : '0 Echilibrat'}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={quickTint}
                onChange={(e) => setQuickTint(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-[#2c374b] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Verde (-50)</span>
                <span>Echilibrat (0)</span>
                <span>Magenta (+50)</span>
              </div>
            </div>

            {/* Opțiunea 4: Saturation & Color Boost Slider */}
            <div className="space-y-2 bg-[#19202c] p-4 rounded-lg border border-[#252f42] relative">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center">4</span>
                  Saturație & Vivacitate
                </span>
                <span className="font-mono text-amber-400 tabular-nums font-bold">
                  {quickSaturation > 0 ? `+${quickSaturation}%` : `${quickSaturation}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="60"
                value={quickSaturation}
                onChange={(e) => setQuickSaturation(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-[#2c374b] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Muted / Pastel (-50%)</span>
                <span>Standard (0%)</span>
                <span>Vivid Accent (+60%)</span>
              </div>
            </div>

            {/* Opțiunea 5: Highlights / Protectie Rochie Albă Slider */}
            <div className="space-y-2 bg-[#19202c] p-4 rounded-lg border border-[#252f42] relative">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center">5</span>
                  Recuperare Lumini (Highlights)
                </span>
                <span className="font-mono text-amber-400 tabular-nums font-bold">
                  {quickHighlights > 0 ? `+${quickHighlights}` : quickHighlights}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="30"
                value={quickHighlights}
                onChange={(e) => setQuickHighlights(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-[#2c374b] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Roll-off Rochie (-50)</span>
                <span>Standard (0)</span>
                <span>Lumini Deschise (+30)</span>
              </div>
            </div>

            {/* Opțiunea 6: Shadows / Detalii Negru & Smoking Slider */}
            <div className="space-y-2 bg-[#19202c] p-4 rounded-lg border border-[#252f42] relative">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center">6</span>
                  Deschidere Umbre (Shadows)
                </span>
                <span className="font-mono text-amber-400 tabular-nums font-bold">
                  {quickShadows > 0 ? `+${quickShadows}` : quickShadows}
                </span>
              </div>
              <input
                type="range"
                min="-40"
                max="50"
                value={quickShadows}
                onChange={(e) => setQuickShadows(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-[#2c374b] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Negru Profund (-40)</span>
                <span>Standard (0)</span>
                <span>Umbre Ridicate (+50)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Stil Estetic Panel */}
        <div className="space-y-3 bg-[#181f2c] p-5 rounded-xl border border-[#273245]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#242e40] pb-2.5">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Panou Stil Estetic (Selectează Look-ul de Bază)
              </span>
              <span className="text-[11px] text-slate-400">
                Alege stilul vizual dorit — se aplică automat cu setările de contrast și temperatură de mai sus.
              </span>
            </div>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              13 Stiluri Disponibile
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 pt-1">
            {[
              {
                id: 'wedding_nature',
                label: 'Nuntă în Natură',
                desc: 'Verdeață calmată, ten romantic, rochie albă pură',
                category: 'Nuntă',
                color: '#10b981',
              },
              {
                id: 'wedding_led',
                label: 'Sală Dans LED Guard',
                desc: 'Protecție ten împotriva spoturilor magenta/cyan',
                category: 'Nuntă',
                color: '#8b5cf6',
              },
              {
                id: 'wedding_arch',
                label: 'Sală Arhitecturală',
                desc: 'Uplighting cald auriu, eleganță, rochie perlată',
                category: 'Nuntă',
                color: '#f59e0b',
              },
              {
                id: 'teal_orange',
                label: 'Teal & Orange',
                desc: 'Hollywood Blockbuster: umbre cian, ten cald',
                category: 'Cinema',
                color: '#06b6d4',
              },
              {
                id: 'kodak_2383',
                label: 'Kodak 2383 Print',
                desc: 'Etalon cinema 35mm, lumini catifelate organice',
                category: 'Cinema',
                color: '#f97316',
              },
              {
                id: 'fuji_eterna',
                label: 'Fujifilm Eterna',
                desc: 'Contrast redus, pasteluri poetice de autor',
                category: 'Cinema',
                color: '#22c55e',
              },
              {
                id: 'punchy',
                label: 'Cinematic Punch',
                desc: 'Curba S dinamică, negru adânc, energie mare',
                category: 'Cinema',
                color: '#3b82f6',
              },
              {
                id: 'bleach',
                label: 'Bleach Bypass',
                desc: 'Desaturat industrial, contrast dur metalic',
                category: 'Cinema',
                color: '#94a3b8',
              },
              {
                id: 'vintage',
                label: 'Vintage 70s Matte',
                desc: 'Negru mat ridicat, textură caldă nostalgică',
                category: 'Vintage',
                color: '#d97706',
              },
              {
                id: 'sepia',
                label: 'Sepia Clasic Antique',
                desc: 'Viraj cald de ciocolată și hârtie fotografică',
                category: 'Vintage',
                color: '#b45309',
              },
              {
                id: 'moody',
                label: 'Moody Dark Nordic',
                desc: 'Tonuri medii întunecate, ambianță intimă',
                category: 'Artistic',
                color: '#64748b',
              },
              {
                id: 'mono_noir',
                label: 'Alb-Negru Argintiu',
                desc: 'Ilford B&W, textură nobilă de argint',
                category: 'Artistic',
                color: '#e2e8f0',
              },
              {
                id: 'neutral',
                label: 'Liniar / Clean',
                desc: 'Standard Rec.709 fără viraj cromatic',
                category: 'Referință',
                color: '#38bdf8',
              },
            ].map((style) => {
              const isSelected = quickLook === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => setQuickLook(style.id as any)}
                  className={`p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/70 ring-1 ring-amber-500/30 shadow-md'
                      : 'bg-[#131722] hover:bg-[#1a202d] border-[#252f41] hover:border-slate-600'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: style.color }}
                        />
                        <span className="text-xs font-semibold text-white tracking-tight">
                          {style.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {style.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                      {style.desc}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="mt-2 pt-1 border-t border-amber-500/20 flex items-center justify-between text-[10px] font-mono text-amber-400">
                      <span>Selectat</span>
                      <span>✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    )}
  </div>
</div>
  );
};
