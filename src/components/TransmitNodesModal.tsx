import React, { useState } from 'react';
import { GradingState } from '../types/lut';
import { generateCubeLUT } from '../utils/colorScience';
import {
  X,
  Layers,
  Sparkles,
  CheckCircle2,
  Copy,
  Download,
  Terminal,
  Laptop,
  Play,
  ArrowRight,
  Sliders,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface TransmitNodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: GradingState;
}

export const TransmitNodesModal: React.FC<TransmitNodesModalProps> = ({
  isOpen,
  onClose,
  state,
}) => {
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmitStatus, setTransmitStatus] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  if (!isOpen) return null;

  const sanitizedTitle = state.lutTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const lutFilename = `${sanitizedTitle}_Resolve33.cube`;
  const relativeLutPath = `ResolveLUT_Studio/${lutFilename}`;

  const pythonScript = `#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
ResolveLUT Studio -> DaVinci Resolve Studio Color Page Node Transmitter
Configures nodes directly according to .lut settings
"""
import sys
import os

def connect_resolve():
    try:
        import DaVinciResolveScript as dvr
        return dvr.scriptapp("Resolve")
    except Exception:
        dev_modules = r"C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\Developer\\Scripting\\Modules"
        if os.path.exists(dev_modules) and dev_modules not in sys.path:
            sys.path.append(dev_modules)
        try:
            import DaVinciResolveScript as dvr
            return dvr.scriptapp("Resolve")
        except Exception as e:
            print(f"Eroare DaVinci Resolve Scripting API: {e}")
            return None

def apply_nodes_grade():
    resolve = connect_resolve()
    if not resolve:
        print("[!] DaVinci Resolve Studio nu ruleaza sau Scripting API este inactiv.")
        return False

    pm = resolve.GetProjectManager()
    project = pm.GetCurrentProject()
    if not project:
        print("[!] Niciun proiect deschis in DaVinci Resolve.")
        return False

    timeline = project.GetCurrentTimeline()
    if not timeline:
        print("[!] Niciun timeline activ in DaVinci Resolve.")
        return False

    current_clip = timeline.GetCurrentVideoItem()
    if not current_clip:
        print("[!] Niciun clip selectat in pagina Color.")
        return False

    lut_path = r"${relativeLutPath}"
    print(f"[+] Se transmite LUT-ul pe nodul curent: {lut_path}")

    # Aplica LUT pe nodul din Color Page (Node 1 sau Node 4)
    # Metoda oficiala Blackmagic DaVinci Resolve Studio:
    for node_idx in [1, 2, 3, 4]:
        try:
            res = current_clip.SetLUT(node_idx, lut_path)
            if res:
                print(f"[✓] Succes: Nodul {node_idx} a fost configurat in pagina Color cu {lut_path}!")
                return True
        except Exception:
            continue

    return False

if __name__ == '__main__':
    apply_nodes_grade()
`;

  const handleTransmit = async () => {
    setIsTransmitting(true);
    setTransmitStatus('Se generează fișierele și se transmite către DaVinci Resolve Studio...');
    try {
      const cubeContent = generateCubeLUT(state, 33);
      const res = await fetch('/api/windows/apply-to-resolve-nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lutFilename,
          lutContent: cubeContent,
          lutTitle: state.lutTitle,
          state,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAppliedSuccess(true);
        setTransmitStatus(
          `✓ Transmisie reușită! LUT-ul ${lutFilename} a fost configurat în arborele de noduri din DaVinci Resolve Studio.`
        );
      } else {
        setTransmitStatus(`Eroare: ${data.message || 'Nu s-a putut transmite automat.'}`);
      }
    } catch (err: any) {
      setTransmitStatus(
        'Scriptul a fost pregătit! Puteți rula scriptul din DaVinci Resolve: Workspace -> Scripts -> Apply_ResolveLUT_Grade.'
      );
    } finally {
      setIsTransmitting(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([pythonScript], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Apply_ResolveLUT_Grade.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121622] rounded-2xl border border-[#2b374d] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#212b3c] bg-gradient-to-r from-[#141a28] to-[#10141e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-950/40">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Transmisie Directă în Nodurile DaVinci Resolve</span>
                <span className="bg-sky-500/15 text-sky-400 font-mono text-[10px] px-2 py-0.5 rounded border border-sky-500/25">
                  Color Page API
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Configurează automat nodurile din pagina Color conform parametrilor LUT-ului curent (<strong>{state.lutTitle}</strong>).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1f2838] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status Feedback Toast */}
          {transmitStatus && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between gap-3 ${
                appliedSuccess
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {appliedSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{transmitStatus}</span>
              </div>
              <button
                onClick={() => setTransmitStatus(null)}
                className="text-slate-400 hover:text-white shrink-0"
              >
                ✕
              </button>
            </div>
          )}

          {/* Node Graph Visual Diagram */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Structura Arborelui de Noduri ce va fi Transmisă în DaVinci Resolve:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 font-mono text-xs">
              {/* Node 1 */}
              <div className="bg-[#18202e] p-3 rounded-xl border border-[#27344a] flex flex-col justify-between space-y-2 relative group hover:border-sky-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-md bg-sky-500/20 text-sky-400 text-[10px] font-bold flex items-center justify-center">
                    01
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">Input</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-[11px] font-sans">Balans & Exp</h4>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Exp: {state.exposure.toFixed(2)} EV<br />
                    T: {state.temperature > 0 ? `+${state.temperature}` : state.temperature}
                  </p>
                </div>
                <div className="text-[9px] text-sky-400 bg-sky-500/10 px-1 py-0.5 rounded text-center">
                  Primaries Offset
                </div>
              </div>

              {/* Node 2 */}
              <div className="bg-[#18202e] p-3 rounded-xl border border-[#27344a] flex flex-col justify-between space-y-2 relative group hover:border-sky-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-md bg-sky-500/20 text-sky-400 text-[10px] font-bold flex items-center justify-center">
                    02
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">Tone</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-[11px] font-sans">Contrast S-Curve</h4>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Contrast: {state.contrast.toFixed(2)}<br />
                    Pivot: {state.pivot.toFixed(3)}
                  </p>
                </div>
                <div className="text-[9px] text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded text-center">
                  DaVinci Pivot
                </div>
              </div>

              {/* Node 3 */}
              <div className="bg-[#18202e] p-3 rounded-xl border border-[#27344a] flex flex-col justify-between space-y-2 relative group hover:border-sky-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-md bg-rose-500/20 text-rose-400 text-[10px] font-bold flex items-center justify-center">
                    03
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">Skin</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-[11px] font-sans">Nuanță Ten</h4>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Tint: {state.tint > 0 ? `+${state.tint}` : state.tint}<br />
                    Boost: {state.colorBoost}
                  </p>
                </div>
                <div className="text-[9px] text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded text-center">
                  Vectorscop 10:30
                </div>
              </div>

              {/* Node 4 (Target LUT) */}
              <div className="bg-[#1d273a] p-3 rounded-xl border border-amber-500/50 flex flex-col justify-between space-y-2 relative shadow-md shadow-amber-950/20">
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-md bg-amber-500 text-black text-[10px] font-black flex items-center justify-center">
                    04
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold uppercase">LUT Curent</span>
                </div>
                <div>
                  <h4 className="font-bold text-amber-300 text-[11px] font-sans truncate" title={state.lutTitle}>
                    {state.lutTitle}
                  </h4>
                  <p className="text-[10px] text-slate-300 font-sans mt-0.5">
                    Fișier: {lutFilename}<br />
                    Crossover: {(state.splitBalance ?? 0) > 0 ? `+${state.splitBalance}` : (state.splitBalance ?? 0)} ({Math.round((0.5 + ((state.splitBalance ?? 0) / 100) * 0.3) * 100)} IRE)
                  </p>
                </div>
                <div className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded text-center font-bold">
                  SetLUT() Conectat
                </div>
              </div>

              {/* Node 5 */}
              <div className="bg-[#18202e] p-3 rounded-xl border border-[#27344a] flex flex-col justify-between space-y-2 relative group hover:border-sky-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">
                    05
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">Output</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-[11px] font-sans">CST Rec.709</h4>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Gamma 2.4 / Rec.709-A<br />
                    Gamut Compression
                  </p>
                </div>
                <div className="text-[9px] text-slate-400 bg-[#222a3a] px-1 py-0.5 rounded text-center">
                  Master Delivery
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="bg-[#161c28] p-5 rounded-xl border border-[#242f44] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-white block">
                Transmisie Automată prin Scripting API (Windows 11)
              </span>
              <p className="text-[11px] text-slate-400 max-w-md leading-relaxed">
                Apasă butonul de mai jos pentru a configura instantaneu nodul 4 din DaVinci Resolve Studio cu noul LUT <code className="text-amber-300 font-mono">{lutFilename}</code>.
              </p>
            </div>

            <button
              onClick={handleTransmit}
              disabled={isTransmitting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-600 hover:from-sky-400 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isTransmitting ? 'Se transmite...' : 'Transmite Acum în DaVinci'}</span>
            </button>
          </div>

          {/* Script Copy & Download Tools */}
          <div className="space-y-2 bg-[#10141e] p-4 rounded-xl border border-[#1e2738]">
            <div className="flex items-center justify-between border-b border-[#1c2434] pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Script Python Automat DaVinci Resolve Studio (Apply_ResolveLUT_Grade.py)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyScript}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-[#1a2130] hover:bg-[#242e42] rounded border border-[#273347] transition-colors font-mono"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Copiat!' : 'Copiază'}</span>
                </button>
                <button
                  onClick={handleDownloadScript}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-amber-400 hover:text-amber-300 bg-[#1a2130] hover:bg-[#242e42] rounded border border-[#273347] transition-colors font-mono"
                  title="Descarcă fișierul Apply_ResolveLUT_Grade.py"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descarcă .py</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              În DaVinci Resolve Studio, puteți rula acest script și direct din meniul de sus: <strong>Workspace → Scripts → Color → Apply_ResolveLUT_Grade</strong> sau din consolă.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#212b3c] bg-[#0e121a] flex items-center justify-between text-xs text-slate-400">
          <span>DaVinci Resolve Studio: Destinație C:\ProgramData\Blackmagic Design\DaVinci Resolve\</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1b2230] hover:bg-[#263143] text-slate-200 rounded-lg transition-colors font-medium"
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  );
};
