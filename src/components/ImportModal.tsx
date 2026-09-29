import React, { useState } from 'react';
import { parseCubeLUT, ParsedCubeLUT } from '../utils/colorScience';
import { Upload, X, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLutImported: (parsed: ParsedCubeLUT) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onLutImported,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    if (!file.name.endsWith('.cube') && !file.name.endsWith('.lut')) {
      setError('Te rugăm să încarci un fișier cu extensia .cube sau .lut');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseCubeLUT(content);

      if (!parsed) {
        setError('Fișierul .cube este invalid sau conține date corupte.');
        return;
      }

      setError(null);
      setSuccessInfo(`LUT 3D încărcat cu succes: "${parsed.title}" (Grilă: ${parsed.size}×${parsed.size}×${parsed.size})`);
      setTimeout(() => {
        onLutImported(parsed);
        onClose();
      }, 1000);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141823] border border-[#2b3548] rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#232c3d] pb-3">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Importă Fișier .cube Existent</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#202838] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
            dragOver
              ? 'border-amber-400 bg-amber-500/10'
              : 'border-[#2e394e] hover:border-slate-500 bg-[#10141d]'
          }`}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.cube,.lut';
            input.onchange = (ev: any) => {
              const file = ev.target?.files?.[0];
              if (file) processFile(file);
            };
            input.click();
          }}
        >
          <FileCode className="w-10 h-10 text-amber-400 mb-3" />
          <p className="text-sm font-semibold text-white">
            Trage și plasează fișierul <code className="text-amber-300">.cube</code> aici
          </p>
          <p className="text-xs text-slate-400 mt-1">
            sau dă clic pentru a naviga în computer
          </p>
          <span className="text-[11px] text-slate-500 font-mono mt-3">
            Compatibil cu LUT-uri 3D DaVinci Resolve (17, 33, 65)
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successInfo && (
          <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successInfo}</span>
          </div>
        )}
      </div>
    </div>
  );
};
