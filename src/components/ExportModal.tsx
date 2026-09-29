import React, { useState, useMemo } from 'react';
import { GradingState, LutGridSize } from '../types/lut';
import { generateCubeLUT } from '../utils/colorScience';
import { Download, Copy, Check, X, FileText, HardDrive, HelpCircle } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: GradingState;
  onUpdateState: (patch: Partial<GradingState>) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState,
}) => {
  const [gridSize, setGridSize] = useState<LutGridSize>(33);
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Generate preview of the cube file
  const cubePreview = useMemo(() => {
    // Generate with size 17 for lightning fast preview representation
    const full = generateCubeLUT(state, 17);
    const lines = full.split('\n');
    return lines.slice(0, 25).join('\n') + `\n... [Total ${gridSize * gridSize * gridSize} linii de date 3D în fișierul final]`;
  }, [state, gridSize]);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const fullCube = generateCubeLUT(state, gridSize);
      const blob = new Blob([fullCube], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const sanitizedName = (state.lutTitle || 'ResolveLUT').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      link.download = `${sanitizedName}_${gridSize}.cube`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsGenerating(false);
      onClose();
    }, 150);
  };

  const handleCopyClipboard = () => {
    const fullCube = generateCubeLUT(state, gridSize);
    navigator.clipboard.writeText(fullCube).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141823] border border-[#2b3548] rounded-xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232c3d] pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Export Fișier .cube pentru DaVinci Resolve Studio</span>
            </h2>
            <p className="text-xs text-slate-400">
              Format standard industrial 3D LUT compatibil cu toate versiunile DaVinci Resolve (17, 18, 19).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#202838] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Nume LUT / Titlu</label>
            <input
              type="text"
              value={state.lutTitle}
              onChange={(e) => onUpdateState({ lutTitle: e.target.value })}
              placeholder="ex: Cine_Kodak2383_Warm"
              className="w-full bg-[#1b212e] border border-[#2c364b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Autor / Colorist</label>
            <input
              type="text"
              value={state.lutCreator}
              onChange={(e) => onUpdateState({ lutCreator: e.target.value })}
              placeholder="ex: Color Studio"
              className="w-full bg-[#1b212e] border border-[#2c364b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Spațiu Culoare & Gamă</label>
            <select
              value={`${state.targetColorSpace}_${state.targetGamma}`}
              onChange={(e) => {
                const [cs, g] = e.target.value.split('_');
                onUpdateState({ targetColorSpace: cs as any, targetGamma: g as any });
              }}
              className="w-full bg-[#1b212e] border border-[#2c364b] rounded-lg px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-mono cursor-pointer"
            >
              <option value="rec709_2.4">Rec.709 / Gamma 2.4 (DaVinci Default)</option>
              <option value="rec709_2.2">Rec.709 / Gamma 2.2 (Web/sRGB)</option>
              <option value="rec709_rec709a">Rec.709-A (Apple Shift Fix)</option>
            </select>
          </div>
        </div>

        {/* LUT Grid Size Selector (17, 33, 65) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Dimensiune Grilă 3D (Mesh Size)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                size: 17 as LutGridSize,
                label: '17×17×17',
                desc: 'Proxy / Monitoare pe platou (ușor, ~120 KB)',
              },
              {
                size: 33 as LutGridSize,
                label: '33×33×33',
                desc: 'Recomandat DaVinci Resolve Studio (~850 KB)',
                recommended: true,
              },
              {
                size: 65 as LutGridSize,
                label: '65×65×65',
                desc: 'Mastering Cinematic precizie maximă (~6.8 MB)',
              },
            ].map((item) => (
              <button
                key={item.size}
                type="button"
                onClick={() => setGridSize(item.size)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  gridSize === item.size
                    ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'bg-[#191f2b] border-[#252f41] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">
                    {item.label}
                  </span>
                  {item.recommended && (
                    <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/20 px-1.5 py-0.5 rounded">
                      Standard
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {item.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Code Preview Box */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono">Previzualizare Fișier .cube:</span>
            <span className="text-slate-400 font-mono">
              Total puncte 3D: <span className="text-amber-400 font-semibold">{gridSize * gridSize * gridSize}</span>
            </span>
          </div>
          <pre className="bg-[#0b0e14] border border-[#21293a] rounded-lg p-3 text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto select-all">
            {cubePreview}
          </pre>
        </div>

        {/* Installation Instructions for DaVinci Resolve */}
        <div className="bg-[#121620] rounded-lg border border-[#232b3c] p-3.5 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <HardDrive className="w-4 h-4" />
            <span>Unde copiezi fișierul în DaVinci Resolve:</span>
          </div>
          <div className="space-y-1 font-mono text-[11px] text-slate-300">
            <div>
              <span className="text-slate-500">Windows:</span>{' '}
              <code className="bg-[#1c2230] px-1 py-0.5 rounded text-amber-300">
                C:\ProgramData\Blackmagic Design\DaVinci Resolve\Support\LUT\
              </code>
            </div>
            <div>
              <span className="text-slate-500">macOS:</span>{' '}
              <code className="bg-[#1c2230] px-1 py-0.5 rounded text-amber-300">
                ~/Library/Application Support/Blackmagic Design/DaVinci Resolve/LUT/
              </code>
            </div>
          </div>
          <p className="text-slate-400 text-[11px] pt-1">
            După copiere, în DaVinci Resolve: <strong className="text-slate-200">Project Settings → Color Management → Apasă "Update Lists"</strong>. Apoi dă clic dreapta pe nodul clipului → 3D LUT → selectează LUT-ul tău!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#232c3d]">
          <button
            onClick={handleCopyClipboard}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-300 bg-[#1b212e] hover:bg-[#252f42] hover:text-white border border-[#2b3548] rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiat în Clipboard!' : 'Copiază Text'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 rounded-lg shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Se generează...' : `Descarcă ${state.lutTitle || 'LUT'}.cube`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
