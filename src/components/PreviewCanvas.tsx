import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GradingState, PreviewMode } from '../types/lut';
import { compilePipeline, applyGradingPixel } from '../utils/colorScience';
import { SampleStill, createCinemaStills } from '../utils/sampleImages';
import {
  Columns2,
  Maximize2,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ArrowLeftRight,
  Sliders,
} from 'lucide-react';

interface PreviewCanvasProps {
  state: GradingState;
  onImageDataReady: (data: ImageData | null) => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({ state, onImageDataReady }) => {
  const [stills, setStills] = useState<SampleStill[]>([]);
  const [activeStillId, setActiveStillId] = useState<string>('cine-portrait');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('split');
  const [splitPos, setSplitPos] = useState<number>(0.5); // 0 to 1
  const [isBypassed, setIsBypassed] = useState<boolean>(false);
  const [isHoldingBefore, setIsHoldingBefore] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1.0);
  const [showZebra, setShowZebra] = useState<boolean>(false);
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const isDraggingSplit = useRef<boolean>(false);
  const holdTimerRef = useRef<any>(null);
  const isPressAndHoldActive = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize sample stills on mount
  useEffect(() => {
    const list = createCinemaStills();
    setStills(list);
  }, []);

  // Active image source
  const currentImageSrc = customImageSrc || stills.find((s) => s.id === activeStillId)?.generate();

  // Load image element
  useEffect(() => {
    if (!currentImageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImageSrc;
    img.onload = () => {
      originalImageRef.current = img;
      renderGradedFrame();
    };
  }, [currentImageSrc]);

  // Keyboard shortcut: Shift+D or D or \ toggles / holds bypass (just like DaVinci Resolve)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase() === 'd') {
        setIsBypassed((prev) => !prev);
      } else if (e.key === '\\' || e.key.toLowerCase() === 'b') {
        setIsHoldingBefore(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === '\\' || e.key.toLowerCase() === 'b') {
        setIsHoldingBefore(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Whether original un-graded image should be shown
  const isShowingOriginal = isBypassed || isHoldingBefore || previewMode === 'original';

  // Re-render when grading state, split position, or before/after state changes
  const renderGradedFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const img = originalImageRef.current;
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Use responsive resolution capped at 960x540 for silky-smooth 60fps interaction
    const targetW = 960;
    const targetH = Math.round((img.naturalHeight / img.naturalWidth) * targetW) || 540;

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    // Draw base original image
    ctx.drawImage(img, 0, 0, targetW, targetH);
    const imgData = ctx.getImageData(0, 0, targetW, targetH);
    const origData = new Uint8ClampedArray(imgData.data);
    const data = imgData.data;

    // If completely bypassed or holding before, just keep original
    if (isShowingOriginal) {
      ctx.putImageData(imgData, 0, 0);
      onImageDataReady(imgData);
      return;
    }

    const pipeline = compilePipeline(state);
    const splitX = Math.round(targetW * splitPos);

    // Apply color grading pipeline
    for (let y = 0; y < targetH; y++) {
      for (let x = 0; x < targetW; x++) {
        const idx = (y * targetW + x) * 4;

        // In split mode, left side is original, right side is graded
        if (previewMode === 'split' && x < splitX) {
          continue; // keep original pixel
        }

        // In side-by-side mode, left half original, right half graded
        if (previewMode === 'side-by-side' && x < targetW / 2) {
          continue;
        }

        const rNorm = origData[idx] / 255;
        const gNorm = origData[idx + 1] / 255;
        const bNorm = origData[idx + 2] / 255;

        const [rGraded, gGraded, bGraded] = applyGradingPixel(rNorm, gNorm, bNorm, pipeline);

        let outR = Math.round(rGraded * 255);
        let outG = Math.round(gGraded * 255);
        let outB = Math.round(bGraded * 255);

        // Optional zebra clipping detection (highlight blown whites > 250 with magenta stripes)
        if (showZebra) {
          if (outR >= 252 && outG >= 252 && outB >= 252) {
            if ((x + y) % 10 < 5) {
              outR = 255;
              outG = 0;
              outB = 255; // Zebra Magenta
            }
          } else if (outR <= 4 && outG <= 4 && outB <= 4) {
            if ((x - y) % 10 < 5) {
              outR = 0;
              outG = 255;
              outB = 255; // Zebra Cyan crushed blacks
            }
          }
        }

        data[idx] = outR;
        data[idx + 1] = outG;
        data[idx + 2] = outB;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // If in split mode, draw a vertical dividing line and labels
    if (previewMode === 'split') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, targetH);
      ctx.stroke();

      // Split handle circle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(splitX, targetH / 2, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(splitX, targetH / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    onImageDataReady(imgData);
  }, [state, splitPos, previewMode, isShowingOriginal, showZebra, onImageDataReady]);

  useEffect(() => {
    renderGradedFrame();
  }, [renderGradedFrame]);

  // Handle dragging the split line or click-and-hold on canvas
  const handlePointerDown = (e: React.PointerEvent) => {
    if (previewMode === 'split') {
      isDraggingSplit.current = true;
      updateSplitFromPointer(e.clientX);
    } else {
      // In full Graded mode, click and hold compares with original (Before/After)
      holdTimerRef.current = setTimeout(() => {
        isPressAndHoldActive.current = true;
        setIsHoldingBefore(true);
      }, 120);
    }
  };

  const handlePointerUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (isPressAndHoldActive.current) {
      isPressAndHoldActive.current = false;
      setIsHoldingBefore(false);
    }
  };

  const updateSplitFromPointer = (clientX: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const pos = Math.max(0.05, Math.min(0.95, (clientX - rect.left) / rect.width));
    setSplitPos(pos);
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!isDraggingSplit.current) return;
      updateSplitFromPointer(e.clientX);
    };
    const onUp = () => {
      isDraggingSplit.current = false;
      if (isPressAndHoldActive.current) {
        isPressAndHoldActive.current = false;
        setIsHoldingBefore(false);
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  // Before/After Dedicated Button Handlers (supports both click toggle and hold-to-compare)
  const handleBeforeAfterPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isPressAndHoldActive.current = true;
    setIsHoldingBefore(true);
  };

  const handleBeforeAfterPointerUp = () => {
    if (isPressAndHoldActive.current) {
      isPressAndHoldActive.current = false;
      setIsHoldingBefore(false);
    }
  };

  const handleBeforeAfterClick = () => {
    // If it was a quick click, toggle the bypass state
    setIsBypassed((prev) => !prev);
  };

  // Custom image upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCustomImageSrc(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-[#12161f] rounded-xl border border-[#212837] overflow-hidden flex flex-col shadow-xl">
      {/* Canvas Viewport Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#161a25] border-b border-[#232b3b] gap-2 select-none">
        {/* Sample footage selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Cadru Test:</span>
          <select
            value={customImageSrc ? 'custom' : activeStillId}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                fileInputRef.current?.click();
              } else {
                setCustomImageSrc(null);
                setActiveStillId(e.target.value);
              }
            }}
            className="bg-[#1e2533] text-xs text-slate-200 border border-[#2d374a] rounded px-2.5 py-1 focus:outline-none cursor-pointer"
          >
            {stills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
            {customImageSrc && <option value="custom">Imaginea Ta Încărcată</option>}
          </select>

          {/* Upload Custom Image Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-[#1e2533] hover:bg-[#283246] border border-[#2e394d] rounded transition-colors"
            title="Încarcă propria poză sau cadru video"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Încarcă Cadru</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* View Mode Controls: Split-Screen / Side-by-Side / Graded / Dedicated Before-After */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented View Mode Tabs */}
          <div className="flex items-center bg-[#1b212e] p-0.5 rounded-lg border border-[#273142]">
            <button
              onClick={() => {
                setPreviewMode('split');
                setIsBypassed(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded transition-colors ${
                previewMode === 'split' && !isShowingOriginal
                  ? 'bg-amber-500/25 text-amber-300 shadow-sm border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mod Split-Screen simultan cu separator glisant (slider A/B)"
            >
              <Columns2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Split-Screen</span>
            </button>
            <button
              onClick={() => {
                setPreviewMode('side-by-side');
                setIsBypassed(false);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                previewMode === 'side-by-side' && !isShowingOriginal
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Alăturat Stânga/Dreapta"
            >
              Side-by-Side
            </button>
            <button
              onClick={() => {
                setPreviewMode('graded');
                setIsBypassed(false);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                previewMode === 'graded' && !isShowingOriginal
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Doar imaginea colorizată cu LUT"
            >
              Doar LUT
            </button>
          </div>

          {/* DEDICATED SLIDER CONTROL FOR SPLIT-SCREEN */}
          {previewMode === 'split' && !isShowingOriginal && (
            <div className="flex items-center gap-2 bg-[#1b212e] px-2.5 py-1 rounded-lg border border-[#283244] shadow-sm animate-in fade-in duration-150">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Separator:</span>
              </span>
              <input
                type="range"
                min="1"
                max="99"
                value={Math.round(splitPos * 100)}
                onChange={(e) => setSplitPos(Number(e.target.value) / 100)}
                className="w-20 sm:w-28 accent-amber-500 cursor-pointer h-1.5 bg-[#293548] rounded-lg"
                title="Ajustează poziția separatorului glisant"
              />
              <span className="font-mono text-[11px] text-amber-400 font-semibold tabular-nums w-8">
                {Math.round(splitPos * 100)}%
              </span>
              <div className="hidden md:flex items-center gap-1 text-[10px] font-mono">
                <button
                  onClick={() => setSplitPos(0.25)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    Math.round(splitPos * 100) === 25
                      ? 'bg-amber-500/30 text-amber-300 font-bold'
                      : 'bg-[#232c3d] hover:bg-[#2c374b] text-slate-300'
                  }`}
                  title="Pozitionează la 25%"
                >
                  25%
                </button>
                <button
                  onClick={() => setSplitPos(0.5)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    Math.round(splitPos * 100) === 50
                      ? 'bg-amber-500/30 text-amber-300 font-bold'
                      : 'bg-[#232c3d] hover:bg-[#2c374b] text-slate-300'
                  }`}
                  title="Centrează la 50%"
                >
                  50%
                </button>
                <button
                  onClick={() => setSplitPos(0.75)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    Math.round(splitPos * 100) === 75
                      ? 'bg-amber-500/30 text-amber-300 font-bold'
                      : 'bg-[#232c3d] hover:bg-[#2c374b] text-slate-300'
                  }`}
                  title="Pozitionează la 75%"
                >
                  75%
                </button>
              </div>
            </div>
          )}

          {/* DEDICATED BEFORE / AFTER (ÎNAINTE / DUPĂ) BUTTON */}
          <button
            onPointerDown={handleBeforeAfterPointerDown}
            onPointerUp={handleBeforeAfterPointerUp}
            onPointerLeave={handleBeforeAfterPointerUp}
            onClick={handleBeforeAfterClick}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border shadow-sm transition-all select-none ${
              isShowingOriginal
                ? 'bg-rose-600 text-white border-rose-500 ring-2 ring-rose-500/30 shadow-rose-950/50'
                : 'bg-[#1e2535] hover:bg-[#283246] text-slate-200 border-[#2f3b50]'
            }`}
            title="Clic pentru a comuta ÎNAINTE/DUPĂ sau ține apăsat pentru comparație rapidă (Tasta D sau \)"
          >
            <ArrowLeftRight className={`w-3.5 h-3.5 ${isShowingOriginal ? 'animate-pulse text-white' : 'text-amber-400'}`} />
            <span>{isShowingOriginal ? 'ÎNAINTE (Original)' : 'DUPĂ (LUT)'}</span>
            <span className="text-[10px] font-mono opacity-60 hidden lg:inline">
              ({isShowingOriginal ? 'original' : 'apasă/ține'})
            </span>
          </button>

          {/* Bypass Indicator Icon Button */}
          <button
            onClick={() => setIsBypassed((prev) => !prev)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isBypassed
                ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                : 'bg-[#1b212e] text-slate-400 border-[#273142] hover:text-white'
            }`}
            title="Bypass complet LUT (Comandă rapidă: Tasta D)"
          >
            {isBypassed ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          {/* Zebras / Clipping indicator */}
          <button
            onClick={() => setShowZebra((prev) => !prev)}
            className={`px-2 py-1 text-xs font-mono rounded-lg border transition-colors ${
              showZebra
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#1b212e] text-slate-400 border-[#273142] hover:text-slate-200'
            }`}
            title="Afișează zebră pentru clipping lumini/umbre"
          >
            Zebra
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className={`relative w-full aspect-[16/9] max-h-[500px] bg-[#090b10] flex items-center justify-center overflow-hidden select-none ${
          previewMode === 'split' ? 'cursor-ew-resize' : 'cursor-pointer'
        }`}
        title={previewMode === 'split' ? 'Trage mouse-ul stânga/dreapta pentru a muta separatorul glisant' : 'Ține apăsat pe imagine pentru a comuta între Înainte și După'}
      >
        <div className="relative inline-block max-w-full max-h-full">
          <canvas
            ref={canvasRef}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            className="block max-w-full max-h-[490px] object-contain rounded shadow-2xl transition-transform duration-100"
          />

          {/* Interactive Split-Screen Sliding Divider Overlay */}
          {previewMode === 'split' && !isShowingOriginal && (
            <div
              className="absolute inset-y-0 pointer-events-none select-none z-20"
              style={{ left: `${splitPos * 100}%` }}
            >
              {/* Divider Line */}
              <div className="absolute top-0 bottom-0 -left-px w-[2px] bg-white shadow-[0_0_12px_rgba(0,0,0,0.9)] pointer-events-auto cursor-ew-resize">
                {/* Center Drag Handle with Grip Arrows */}
                <div
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    isDraggingSplit.current = true;
                    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                  }}
                  onPointerMove={(e) => {
                    if (isDraggingSplit.current) {
                      updateSplitFromPointer(e.clientX);
                    }
                  }}
                  onPointerUp={(e) => {
                    isDraggingSplit.current = false;
                    try {
                      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
                    } catch (err) {}
                  }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#121622]/95 backdrop-blur-md border-2 border-white text-white shadow-2xl flex items-center justify-center cursor-ew-resize hover:scale-110 active:scale-95 transition-all group pointer-events-auto ring-4 ring-black/40"
                  title="Trage separatorul glisant Split-Screen (A/B)"
                >
                  <div className="flex items-center text-[10px] font-bold text-amber-400 group-hover:text-white transition-colors">
                    ◀▶
                  </div>
                </div>

                {/* Percentage Tag */}
                <div className="absolute top-3 -translate-x-1/2 bg-black/85 backdrop-blur text-white border border-white/20 px-2 py-0.5 rounded text-[10px] font-mono pointer-events-none whitespace-nowrap shadow-lg">
                  {Math.round(splitPos * 100)}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Mode Badges Overlay */}
        {previewMode === 'split' && !isShowingOriginal && (
          <div className="absolute top-3 inset-x-4 flex justify-between pointer-events-none text-[11px] font-mono font-semibold z-10">
            <span className="bg-black/75 backdrop-blur text-slate-300 px-2.5 py-1 rounded border border-white/10 shadow-md">
              ◀ STÂNGA: ORIGINAL (IN)
            </span>
            <span className="bg-amber-950/90 backdrop-blur text-amber-300 px-2.5 py-1 rounded border border-amber-500/40 shadow-md">
              DREAPTA: DUPĂ (REC.709 G2.4 LUT) ▶
            </span>
          </div>
        )}

        {/* Active Before / After State Pill Overlay */}
        {isShowingOriginal && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-rose-600/95 backdrop-blur-md text-white px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-2xl border border-rose-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>ÎNAINTE: IMAGINE ORIGINALĂ (FĂRĂ LUT)</span>
            </div>
          </div>
        )}

        {!isShowingOriginal && previewMode !== 'split' && (
          <div className="absolute top-3 right-4 pointer-events-none opacity-80 hover:opacity-100 transition-opacity">
            <div className="bg-black/70 backdrop-blur text-amber-300 px-2.5 py-1 rounded font-mono text-[11px] border border-amber-500/30 shadow-md">
              DUPĂ: {state.lutTitle} (Rec.709 G2.4)
            </div>
          </div>
        )}

        {/* Floating Quick "Hold to Compare" Trigger Badge at bottom-right */}
        {previewMode !== 'split' && (
          <div className="absolute bottom-3 right-4 z-10">
            <button
              onPointerDown={handleBeforeAfterPointerDown}
              onPointerUp={handleBeforeAfterPointerUp}
              onPointerLeave={handleBeforeAfterPointerUp}
              onClick={handleBeforeAfterClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium shadow-lg backdrop-blur-md transition-all active:scale-95 ${
                isShowingOriginal
                  ? 'bg-rose-600 text-white border border-rose-400 ring-2 ring-rose-500/40'
                  : 'bg-black/75 hover:bg-black/90 text-slate-300 hover:text-white border border-white/20'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
              <span>{isShowingOriginal ? 'Eliberează pentru DUPĂ' : 'Ține apăsat: ÎNAINTE'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Viewport Footer Info */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#12151d] border-t border-[#1f2635] text-[11px] font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span>960×540 Proxy Realtime</span>
          <span className="text-slate-600">·</span>
          <span>LUT Titlu: <span className="text-amber-400">{state.lutTitle}</span></span>
          <span className="text-slate-600">·</span>
          <span className="text-amber-300/90 font-medium">Rec.709 / Gamma {state.targetGamma}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 hidden sm:inline">
            Comparație: Clic sau ține apăsat pe <kbd className="px-1.5 py-0.5 bg-[#1d2432] rounded text-slate-200">Before/After</kbd> sau tasta <kbd className="px-1 py-0.5 bg-[#1d2432] rounded text-slate-200">D</kbd> / <kbd className="px-1 py-0.5 bg-[#1d2432] rounded text-slate-200">\</kbd>
          </span>
        </div>
      </div>
    </div>
  );
};

