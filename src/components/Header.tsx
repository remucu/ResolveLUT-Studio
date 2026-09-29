import React from 'react';
import { Download, Upload, BookOpen, Sparkles, SlidersHorizontal, Activity, Undo2, Redo2, Laptop, Layers } from 'lucide-react';

interface HeaderProps {
  activeTab: 'grading' | 'curves' | 'hsl' | 'scopes' | 'quick-luts' | 'guide' | 'windows';
  setActiveTab: (tab: 'grading' | 'curves' | 'hsl' | 'scopes' | 'quick-luts' | 'guide' | 'windows') => void;
  onOpenExport: () => void;
  onOpenImport: () => void;
  onOpenTransmit?: () => void;
  currentLutTitle: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  undoCount?: number;
  redoCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  onOpenImport,
  onOpenTransmit,
  currentLutTitle,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  undoCount = 0,
  redoCount = 0,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-[#12151d] border-b border-[#232936] select-none sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center shadow-md shadow-rose-950/40">
            <span className="font-mono font-bold text-xs text-white">3D</span>
          </div>
          <span className="text-base font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
            ResolveLUT Studio
          </span>
        </a>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-600">·</span>
          <span className="text-amber-400/90 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Rec.709 / Gamma 2.4
          </span>
        </div>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setActiveTab('quick-luts')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'quick-luts'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-300 hover:text-white hover:bg-[#1a202c]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>LUT-uri de Bază</span>
        </button>

        <button
          onClick={() => setActiveTab('grading')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'grading'
              ? 'bg-[#222b3b] text-white border border-slate-700'
              : 'text-slate-300 hover:text-white hover:bg-[#1a202c]'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Roți & Primare</span>
        </button>

        <button
          onClick={() => setActiveTab('curves')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'curves'
              ? 'bg-[#222b3b] text-white border border-slate-700'
              : 'text-slate-300 hover:text-white hover:bg-[#1a202c]'
          }`}
        >
          <span>Curbe RGB</span>
        </button>

        <button
          onClick={() => setActiveTab('hsl')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'hsl'
              ? 'bg-[#222b3b] text-white border border-slate-700'
              : 'text-slate-300 hover:text-white hover:bg-[#1a202c]'
          }`}
        >
          <span>HSL Selectiv</span>
        </button>

        <button
          onClick={() => setActiveTab('scopes')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'scopes'
              ? 'bg-[#222b3b] text-white border border-slate-700'
              : 'text-slate-300 hover:text-white hover:bg-[#1a202c]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Osciloscoape</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'guide'
              ? 'bg-[#222b3b] text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a202c]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Ghid DaVinci</span>
        </button>

        <button
          onClick={() => setActiveTab('windows')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'windows'
              ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-[#1a202c]'
          }`}
          title="Conexiune Windows 11 cu drepturi de Administrator & DaVinci Resolve Studio"
        >
          <Laptop className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Windows 11 & Resolve</span>
        </button>
      </nav>

      {/* Zone 3: Undo/Redo & Actions */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo Control Cluster */}
        <div className="flex items-center bg-[#181d28] p-0.5 rounded-lg border border-[#263042]">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title={canUndo ? `Anulează ultima modificare (Ctrl+Z) [${undoCount} în istoric]` : 'Nimic de anulat (Ctrl+Z)'}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${
              canUndo
                ? 'text-slate-200 hover:text-amber-300 hover:bg-[#232c3f]'
                : 'text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Undo</span>
            {undoCount > 0 && (
              <span className="text-[10px] font-mono text-slate-400 hidden xl:inline">
                ({undoCount})
              </span>
            )}
          </button>

          <div className="w-[1px] h-3.5 bg-[#2c374b]" />

          <button
            onClick={onRedo}
            disabled={!canRedo}
            title={canRedo ? `Refă modificarea (Ctrl+Y sau Ctrl+Shift+Z) [${redoCount} în istoric]` : 'Nimic de refăcut (Ctrl+Y)'}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${
              canRedo
                ? 'text-slate-200 hover:text-amber-300 hover:bg-[#232c3f]'
                : 'text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Redo</span>
            {redoCount > 0 && (
              <span className="text-[10px] font-mono text-slate-400 hidden xl:inline">
                ({redoCount})
              </span>
            )}
          </button>
        </div>

        <button
          onClick={onOpenImport}
          title="Importă un fișier .cube existent"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#1a202c] hover:bg-[#252e3e] hover:text-white border border-[#2e3748] rounded-lg transition-colors whitespace-nowrap"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Importă .cube</span>
        </button>

        <button
          onClick={onOpenTransmit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 rounded-lg shadow-sm shadow-indigo-950/30 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          title="Transmite nodurile configurate conform acestui LUT direct în DaVinci Resolve (Color Page)"
        >
          <Layers className="w-3.5 h-3.5 text-sky-200" />
          <span className="hidden sm:inline">Transmite în Noduri</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 rounded-lg shadow-sm shadow-rose-950/30 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportă .cube</span>
        </button>
      </div>
    </header>
  );
};
