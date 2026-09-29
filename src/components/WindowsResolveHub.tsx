import React, { useState, useEffect } from 'react';
import { GradingState } from '../types/lut';
import { generateCubeLUT } from '../utils/colorScience';
import { CINEMA_PRESETS, applyPresetToState } from '../utils/presets';
import {
  ShieldCheck,
  Terminal,
  FolderDown,
  Play,
  CheckCircle2,
  Copy,
  ExternalLink,
  Laptop,
  Sparkles,
  HeartHandshake,
  AlertTriangle,
  RotateCw,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface WindowsResolveHubProps {
  currentState: GradingState;
  onApplyPreset: (state: GradingState) => void;
  onOpenTransmit?: () => void;
}

export const WindowsResolveHub: React.FC<WindowsResolveHubProps> = ({
  currentState,
  onApplyPreset,
  onOpenTransmit,
}) => {
  const [status, setStatus] = useState<{
    isWindows: boolean;
    isAdmin: boolean;
    resolveInstalled: boolean;
    resolveExePath: string;
    resolveLutPath: string;
    message: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isExportingBatch, setIsExportingBatch] = useState<boolean>(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    status: true,
    styles: true,
    guide: false,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resolveExePath = 'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\Resolve.exe';
  const resolveLutPath = 'C:\\ProgramData\\Blackmagic Design\\DaVinci Resolve\\Support\\LUT\\ResolveLUT_Studio';
  const powershellCommand = `powershell -Command "Start-Process '${resolveExePath}' -Verb RunAs"`;

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/windows/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.warn('Backend status check failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(powershellCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // Launch DaVinci Resolve Studio as Administrator
  const handleLaunchResolve = async () => {
    setActionFeedback('Se trimite comanda de pornire ca Administrator...');
    try {
      const res = await fetch('/api/windows/launch-resolve', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionFeedback('✓ DaVinci Resolve Studio a fost lansat cu drepturi de Administrator!');
      } else {
        setActionFeedback(`Eroare: ${data.message || 'Nu s-a putut lansa aplicația.'}`);
      }
    } catch (err) {
      setActionFeedback('Comandă copiată în clipboard! Rulează în PowerShell / Terminal pe Windows 11.');
      handleCopyCommand();
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Install current LUT directly to DaVinci Resolve directory
  const handleInstallCurrentLut = async () => {
    setActionFeedback('Se instalează LUT-ul curent în DaVinci Resolve Studio...');
    try {
      const cubeContent = generateCubeLUT(currentState, 33);
      const filename = `${currentState.lutTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Resolve33.cube`;

      const res = await fetch('/api/windows/install-luts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          luts: [{ filename, content: cubeContent }],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionFeedback(`✓ LUT-ul a fost instalat în ${resolveLutPath}`);
      } else {
        setActionFeedback(`Eroare: ${data.message}`);
      }
    } catch (err) {
      setActionFeedback('Eroare conexiune. Descărcați scriptul .bat pentru instalare automată.');
    }
    setTimeout(() => setActionFeedback(null), 4500);
  };

  // Download Standalone Windows 11 .exe Executable
  const handleDownloadExe = () => {
    setActionFeedback('✓ Se descarcă aplicația ResolveLUTStudio.exe pentru Windows 11...');
    const link = document.createElement('a');
    link.href = '/api/windows/download-exe';
    link.download = 'ResolveLUTStudio.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Download Windows 11 Administrator Batch Package
  const handleDownloadAdminInstaller = async () => {
    setIsExportingBatch(true);
    try {
      // Gather all wedding presets
      const weddingPresets = CINEMA_PRESETS.filter((p) => p.category === 'wedding' || p.category === 'camera_profile');
      const lutsPayload = weddingPresets.map((preset) => {
        const fullState = applyPresetToState(currentState, preset);
        const cube = generateCubeLUT(fullState, 33);
        return {
          filename: `${preset.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}_Resolve33.cube`,
          content: cube,
        };
      });

      // Add current customized LUT as well
      lutsPayload.unshift({
        filename: `${currentState.lutTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_CustomResolve33.cube`,
        content: generateCubeLUT(currentState, 33),
      });

      const res = await fetch('/api/windows/download-installer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ luts: lutsPayload }),
      });

      if (!res.ok) throw new Error('Eroare la generarea scriptului.');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Install_ResolveLUT_Win11_Admin.bat';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setActionFeedback('✓ Pachetul Install_ResolveLUT_Win11_Admin.bat a fost descărcat!');
    } catch (err) {
      setActionFeedback('Eroare la descărcare.');
    } finally {
      setIsExportingBatch(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const weddingStylesList = CINEMA_PRESETS.filter((p) => p.category === 'wedding');

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#111827] via-[#1a2335] to-[#121622] p-6 rounded-xl border border-[#2b3952] shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-sky-500/20 text-sky-400 font-mono text-xs font-semibold px-2.5 py-0.5 rounded border border-sky-500/30 flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5" />
              Windows 11 Integration
            </span>
            <span className="text-slate-600">·</span>
            <span className="bg-amber-500/20 text-amber-300 font-mono text-xs font-semibold px-2.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrator Privileges (UAC)
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Conexiune Windows 11 cu DaVinci Resolve Studio
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Rulează direct pe <strong>Windows 11</strong> cu drepturi de Administrator pentru a accesa și lansa{' '}
            <strong>DaVinci Resolve Studio</strong> și pentru a instala LUT-urile de nuntă direct în directorul de sistem protejat{' '}
            <code className="text-amber-300 bg-black/40 px-1.5 py-0.5 rounded font-mono text-[11px]">
              C:\ProgramData\Blackmagic Design\DaVinci Resolve\Support\LUT\
            </code>.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Transmit Directly to Nodes */}
          {onOpenTransmit && (
            <button
              onClick={onOpenTransmit}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Configurează automat arborele de noduri din DaVinci Resolve Studio conform .lut"
            >
              <Layers className="w-4 h-4 text-sky-200" />
              <span>Transmite în Noduri (Color Page)</span>
            </button>
          )}

          {/* Primary Action: Download Standalone .exe for Windows 11 */}
          <button
            onClick={handleDownloadExe}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Descarcă aplicația nativă completă ResolveLUTStudio.exe pentru Windows 11"
          >
            <FolderDown className="w-4 h-4 text-white" />
            <span>Descarcă Aplicația (.exe Desktop)</span>
          </button>

          <button
            onClick={handleLaunchResolve}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-rose-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Lansează DaVinci Resolve Studio ca Administrator pe Windows 11"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Pornește DaVinci Resolve (Admin)</span>
          </button>

          <button
            onClick={handleDownloadAdminInstaller}
            disabled={isExportingBatch}
            className="flex items-center gap-2 px-3 py-2 bg-[#1e293b] hover:bg-[#28374d] text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-[#374763] shadow-md transition-all"
            title="Descarcă scriptul alternativ .bat care instalează LUT-urile și pornește Resolve"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>{isExportingBatch ? 'Se generează...' : 'Script (.bat)'}</span>
          </button>
        </div>
      </div>

      {/* Action feedback toast */}
      {actionFeedback && (
        <div className="bg-amber-500/15 border border-amber-500/40 text-amber-300 px-4 py-2.5 rounded-lg text-xs font-mono flex items-center justify-between animate-in fade-in duration-200 shadow-lg">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            {actionFeedback}
          </span>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Accordion 1: Status Detection & Admin Configuration */}
      <div className="bg-[#121622] rounded-xl border border-[#232b3b] overflow-hidden transition-all">
        <button
          onClick={() => toggleSection('status')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#181e2c] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold text-xs flex items-center justify-center border border-sky-500/30">
              1
            </span>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Rubrica 1: Stare Sistem Windows 11 & Permisiuni UAC (DaVinci Resolve)
              </h3>
              {!openSections.status && (
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Windows 11 x64 | Administrator: DA | Executabil: ResolveLUTStudio.exe | Resolve.exe: Detectat
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {openSections.status ? 'Restrânge' : 'Desfășoară'}
            </span>
            <div className={`p-1 rounded-md bg-[#1f2736] text-slate-300 transition-transform duration-200 ${openSections.status ? 'rotate-180 text-sky-400' : ''}`}>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>

        {openSections.status && (
          <div className="p-5 pt-2 border-t border-[#212938] grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
            {/* Card 1: Diagnostic & Status */}
            <div className="bg-[#131722] p-4 rounded-xl border border-[#232b3b] space-y-4">
              <div className="flex items-center justify-between border-b border-[#212938] pb-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Stare Sistem & Permisiuni</span>
                </div>
                <button
                  onClick={fetchStatus}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  title="Reîmprospătează"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between bg-[#19202c] p-2 rounded-lg border border-[#263143]">
                  <span className="text-slate-400">Sistem Operare:</span>
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-sky-400" />
                    Windows 11 / 64-bit
                  </span>
                </div>

                <div className="flex items-center justify-between bg-[#19202c] p-2 rounded-lg border border-[#263143]">
                  <span className="text-slate-400">Drepturi Administrator (UAC):</span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    requireAdministrator
                  </span>
                </div>

                <div className="flex items-center justify-between bg-[#19202c] p-2 rounded-lg border border-[#263143]">
                  <span className="text-slate-400">Fișier Aplicație (.exe):</span>
                  <span className="font-mono text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <span>ResolveLUTStudio.exe</span>
                  </span>
                </div>

                <div className="flex items-center justify-between bg-[#19202c] p-2 rounded-lg border border-[#263143]">
                  <span className="text-slate-400">Locație DaVinci Resolve Studio:</span>
                  <span className="font-mono text-[11px] text-amber-300">Resolve.exe</span>
                </div>

                <div className="text-[11px] text-slate-400 bg-[#161b26] p-2.5 rounded-lg border border-[#202737] leading-relaxed">
                  Manifestul nativ Windows 11 (<code className="text-slate-300 font-mono">windows/app.manifest</code>) solicită automat elevarea UAC pentru acces deplin la procesele Blackmagic Design.
                </div>
              </div>
            </div>

            {/* Card 2: Direct Commands & Launcher */}
            <div className="bg-[#131722] p-4 rounded-xl border border-[#232b3b] space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-[#212938] pb-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>Execuție Directă DaVinci Resolve Studio (PowerShell / CMD)</span>
                </div>
                <button
                  onClick={handleCopyCommand}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCmd ? 'Copiat!' : 'Copiază'}</span>
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Puteți lansa instantaneu DaVinci Resolve Studio ca Administrator folosind comanda nativă Windows 11:
                </p>

                <div className="relative bg-[#0b0e14] p-3 rounded-lg border border-[#1e2533] font-mono text-[11px] text-amber-300 flex items-center justify-between gap-3 overflow-x-auto">
                  <code>{powershellCommand}</code>
                  <button
                    onClick={handleCopyCommand}
                    className="shrink-0 px-2 py-1 bg-[#1a2333] hover:bg-[#253247] text-slate-200 rounded text-xs transition-colors"
                  >
                    {copiedCmd ? '✓ Copiat' : 'Copiază'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {onOpenTransmit && (
                    <button
                      onClick={onOpenTransmit}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-sky-600/30 to-indigo-600/30 hover:from-sky-600/50 hover:to-indigo-600/50 text-sky-200 hover:text-white rounded-lg border border-sky-500/40 text-xs font-semibold transition-colors"
                      title="Deschide consola de transmisie directă în pagina Color din DaVinci Resolve"
                    >
                      <Layers className="w-4 h-4 text-sky-300" />
                      <span>Transmite în Noduri Color</span>
                    </button>
                  )}
                  <button
                    onClick={handleInstallCurrentLut}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-[#1b2230] hover:bg-[#242f42] text-slate-200 hover:text-white rounded-lg border border-[#2d3a50] text-xs font-medium transition-colors"
                  >
                    <FolderDown className="w-4 h-4 text-sky-400" />
                    <span>Instalează LUT în Resolve</span>
                  </button>

                  <button
                    onClick={handleLaunchResolve}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-[#1b2230] hover:bg-[#242f42] text-slate-200 hover:text-white rounded-lg border border-[#2d3a50] text-xs font-medium transition-colors"
                  >
                    <Play className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                    <span>Pornire Resolve.exe</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 2: Trending Wedding Styles Collection */}
      <div className="bg-[#121622] rounded-xl border border-[#232b3b] overflow-hidden transition-all">
        <button
          onClick={() => toggleSection('styles')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#181e2c] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-mono font-bold text-xs flex items-center justify-center border border-rose-500/30">
              2
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Rubrica 2: Stiluri Diverse de Nuntă (Trending Wedding Cinema Looks)
                </h3>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {weddingStylesList.length} Stiluri Rec.709
                </span>
              </div>
              {!openSections.styles && (
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Boho Terracotta, Light & Airy, Moody Emerald, Tuscan Sunset, Kodak Portra 400, Retro Super 8, Editorial Vogue...
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {openSections.styles ? 'Restrânge' : 'Desfășoară'}
            </span>
            <div className={`p-1 rounded-md bg-[#1f2736] text-slate-300 transition-transform duration-200 ${openSections.styles ? 'rotate-180 text-rose-400' : ''}`}>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>

        {openSections.styles && (
          <div className="p-6 pt-2 border-t border-[#212938] space-y-4 animate-in fade-in duration-150">
            <p className="text-xs text-slate-400">
              Stiluri cromatice populare pentru videografie și cinematografie de nuntă, calibrate profesional pentru DaVinci Resolve Studio:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weddingStylesList.map((style) => (
                <div
                  key={style.id}
                  className="bg-[#181e2b] p-4 rounded-xl border border-[#283447] flex flex-col justify-between space-y-3 hover:border-amber-500/40 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: style.previewColor }}
                        />
                        <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          {style.name}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        33 MESH
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {style.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#232c3d]">
                    <button
                      onClick={() => onApplyPreset(applyPresetToState(currentState, style))}
                      className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Aplică în Editor</span>
                    </button>

                    <button
                      onClick={() => {
                        const fullState = applyPresetToState(currentState, style);
                        const cubeContent = generateCubeLUT(fullState, 33);
                        const blob = new Blob([cubeContent], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${style.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}_Resolve33.cube`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      }}
                      className="px-2.5 py-1 text-xs bg-[#242e40] hover:bg-[#2f3c54] text-slate-200 rounded transition-colors font-mono"
                      title="Descarcă direct fișierul .cube"
                    >
                      Descarcă .cube
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Accordion 3: Ghid Configurare Permanentă Administrator */}
      <div className="bg-[#121622] rounded-xl border border-[#232b3b] overflow-hidden transition-all">
        <button
          onClick={() => toggleSection('guide')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#181e2c] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center border border-amber-500/30">
              3
            </span>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Rubrica 3: Ghid Configurare Permanentă Administrator pe Windows 11
              </h3>
              {!openSections.guide && (
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Setare Resolve.exe Compatibility → Run as administrator | Acces C:\ProgramData | Update Lists
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {openSections.guide ? 'Restrânge' : 'Desfășoară'}
            </span>
            <div className={`p-1 rounded-md bg-[#1f2736] text-slate-300 transition-transform duration-200 ${openSections.guide ? 'rotate-180 text-amber-400' : ''}`}>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>

        {openSections.guide && (
          <div className="p-6 pt-2 border-t border-[#212938] grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-300 animate-in fade-in duration-150">
            <div className="bg-[#171d29] p-4 rounded-lg border border-[#252f41] space-y-2">
              <span className="font-bold text-amber-400 font-mono text-[11px] block">
                PASUL 1: Permisiuni Resolve.exe
              </span>
              <p className="leading-relaxed">
                Navigați în Explorer la <code className="text-slate-200 bg-black/40 px-1 py-0.5 rounded font-mono text-[10px]">C:\Program Files\Blackmagic Design\DaVinci Resolve\</code>, dați click dreapta pe <code className="text-amber-300 font-mono">Resolve.exe</code> → <em>Properties</em> → tabul <em>Compatibility</em> → bifați <strong>„Run this program as an administrator”</strong>.
              </p>
            </div>

            <div className="bg-[#171d29] p-4 rounded-lg border border-[#252f41] space-y-2">
              <span className="font-bold text-amber-400 font-mono text-[11px] block">
                PASUL 2: Directorul de LUT-uri
              </span>
              <p className="leading-relaxed">
                Fișierele <code className="text-amber-300 font-mono">.cube</code> sunt plasate în <code className="text-slate-200 bg-black/40 px-1 py-0.5 rounded font-mono text-[10px]">C:\ProgramData\Blackmagic Design\DaVinci Resolve\Support\LUT\ResolveLUT_Studio\</code>. Acest director necesită drepturi de administrator pentru scriere.
              </p>
            </div>

            <div className="bg-[#171d29] p-4 rounded-lg border border-[#252f41] space-y-2">
              <span className="font-bold text-amber-400 font-mono text-[11px] block">
                PASUL 3: Actualizare în DaVinci Resolve
              </span>
              <p className="leading-relaxed">
                În DaVinci Resolve Studio: mergeți în pagina <strong>Color</strong> → apăsați pe rotița de setări (dreapta-jos) → secțiunea <strong>Color Management</strong> → apăsați butonul <strong>„Update Lists”</strong>. Toate LUT-urile vor apărea instantaneu!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
