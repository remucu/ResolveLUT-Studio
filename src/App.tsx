/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef } from 'react';
import { GradingState, CurvePoint, RGBVec, HslHueShift } from './types/lut';
import { DEFAULT_GRADING_STATE, ParsedCubeLUT } from './utils/colorScience';
import { Header } from './components/Header';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ColorWheel } from './components/ColorWheel';
import { PrimarySliders } from './components/PrimarySliders';
import { CurvesEditor } from './components/CurvesEditor';
import { HslCurves } from './components/HslCurves';
import { Scopes } from './components/Scopes';
import { QuickStarterLuts } from './components/QuickStarterLuts';
import { DaVinciGuide } from './components/DaVinciGuide';
import { WindowsResolveHub } from './components/WindowsResolveHub';
import { ExportModal } from './components/ExportModal';
import { ImportModal } from './components/ImportModal';
import { TransmitNodesModal } from './components/TransmitNodesModal';
import { BASIC_STARTER_LUTS, CINEMA_PRESETS, applyPresetToState } from './utils/presets';
import { useGradingHistory } from './utils/useGradingHistory';
import { RotateCcw, Sparkles, SlidersHorizontal, Activity, Undo2, Redo2, ChevronDown } from 'lucide-react';

export default function App() {
  const [isWheelsOpen, setIsWheelsOpen] = useState<boolean>(true);
  const initialPreset = CINEMA_PRESETS.find((p) => p.id === 'wedding-nature-outdoor') || BASIC_STARTER_LUTS[0];
  const initialState = applyPresetToState(DEFAULT_GRADING_STATE, initialPreset);

  const {
    state: gradingState,
    setState: setGradingState,
    updateGradingState,
    undo,
    redo,
    canUndo,
    canRedo,
    undoCount,
    redoCount,
    lastActionName,
  } = useGradingHistory(initialState);

  const [activeTab, setActiveTab] = useState<'grading' | 'curves' | 'hsl' | 'scopes' | 'quick-luts' | 'guide' | 'windows'>('quick-luts');
  const [quickPillCategory, setQuickPillCategory] = useState<'all' | 'wedding' | 'camera_profile' | 'basic'>('wedding');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isTransmitOpen, setIsTransmitOpen] = useState<boolean>(false);

  // Scopes image data sharing
  const lastImageDataRef = useRef<ImageData | null>(null);
  const [scopesTrigger, setScopesTrigger] = useState<number>(0);

  const handleImageDataReady = useCallback((data: ImageData | null) => {
    lastImageDataRef.current = data;
    setScopesTrigger((prev) => prev + 1);
  }, []);

  const getImageData = useCallback(() => {
    return lastImageDataRef.current;
  }, []);

  const handleResetAll = () => {
    setGradingState(DEFAULT_GRADING_STATE, 'Resetează Grade', true);
  };

  const handleCurveChange = (channel: 'master' | 'red' | 'green' | 'blue', points: CurvePoint[]) => {
    if (channel === 'master') updateGradingState({ masterCurve: points }, 'Curbă Master');
    if (channel === 'red') updateGradingState({ redCurve: points }, 'Curbă Roșu');
    if (channel === 'green') updateGradingState({ greenCurve: points }, 'Curbă Verde');
    if (channel === 'blue') updateGradingState({ blueCurve: points }, 'Curbă Albastru');
  };

  const handleResetCurveChannel = (channel: 'master' | 'red' | 'green' | 'blue') => {
    const neutral = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
    handleCurveChange(channel, neutral);
  };

  return (
    <div className="min-h-screen bg-[#0d1017] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenTransmit={() => setIsTransmitOpen(true)}
        currentLutTitle={gradingState.lutTitle}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        undoCount={undoCount}
        redoCount={redoCount}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto p-4 lg:p-6 space-y-6">
        {/* Quick LUT Switcher Pill Bar (Always visible for fast testing) */}
        <div className="flex flex-col gap-2.5 bg-[#131722] p-3 rounded-xl border border-[#212837] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1d2332] pb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-300 font-mono shrink-0 flex items-center gap-1.5 mr-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Puncte Rapide:
              </span>
              <button
                onClick={() => setQuickPillCategory('wedding')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  quickPillCategory === 'wedding'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Stiluri Nuntă
              </button>
              <button
                onClick={() => setQuickPillCategory('camera_profile')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  quickPillCategory === 'camera_profile'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Camere (GH5 / UX90 / FX30 / R6)
              </button>
              <button
                onClick={() => setQuickPillCategory('basic')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  quickPillCategory === 'basic'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bază (Contrast/Balans)
              </button>
              <button
                onClick={() => setQuickPillCategory('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  quickPillCategory === 'all'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Toate
              </button>
            </div>

            {/* Undo, Redo, and Reset Buttons Group */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#181d28] p-0.5 rounded-lg border border-[#252f41]">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  title="Anulează ultima modificare (Ctrl+Z)"
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    canUndo
                      ? 'text-slate-200 hover:text-amber-300 hover:bg-[#232c3f]'
                      : 'text-slate-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Undo</span>
                  {undoCount > 0 && <span className="text-[10px] font-mono text-slate-400">({undoCount})</span>}
                </button>
                <div className="w-[1px] h-3 bg-[#2a3447]" />
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  title="Refă modificarea (Ctrl+Y)"
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    canRedo
                      ? 'text-slate-200 hover:text-amber-300 hover:bg-[#232c3f]'
                      : 'text-slate-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Redo2 className="w-3.5 h-3.5" />
                  <span>Redo</span>
                  {redoCount > 0 && <span className="text-[10px] font-mono text-slate-400">({redoCount})</span>}
                </button>
              </div>

              <button
                onClick={handleResetAll}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 hover:bg-[#1a202d] px-2.5 py-1.5 rounded-lg transition-colors border border-transparent hover:border-[#2a3448]"
                title="Resetează toate setările la valorile de fabrică"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resetează Grade</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar">
            {(quickPillCategory === 'all'
              ? CINEMA_PRESETS
              : quickPillCategory === 'basic'
              ? BASIC_STARTER_LUTS
              : CINEMA_PRESETS.filter((p) => p.category === quickPillCategory)
            ).map((preset) => {
              const isActive = gradingState.lutTitle === (preset.state.lutTitle || preset.name);
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setGradingState(applyPresetToState(gradingState, preset), `Preset: ${preset.name}`, true);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm ring-1 ring-amber-500/20'
                      : 'bg-[#1b212f] text-slate-300 hover:text-white hover:bg-[#252d3f] border border-[#283246]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: preset.previewColor }}
                  />
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Section: Cinema Viewport & Scopes side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Cinema Viewport (7 or 8 columns on large screens) */}
          <div className="lg:col-span-8">
            <PreviewCanvas
              state={gradingState}
              onImageDataReady={handleImageDataReady}
            />
          </div>

          {/* Integrated Real-time Video Scopes (4 columns) */}
          <div className="lg:col-span-4 space-y-4">
            <Scopes
              getImageData={getImageData}
              refreshTrigger={scopesTrigger}
            />

            {/* Quick summary card */}
            <div className="bg-[#151922] p-4 rounded-xl border border-[#232a38] text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-300 font-semibold border-b border-[#212838] pb-2">
                <span>Stare Activă .cube</span>
                <span className="font-mono text-amber-400 text-[11px]">{gradingState.lutTitle}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                <div>Contrast: <span className="text-white">{gradingState.contrast.toFixed(2)}</span></div>
                <div>Temp: <span className="text-white">{gradingState.temperature}</span></div>
                <div>Saturație: <span className="text-white">{gradingState.saturation.toFixed(2)}</span></div>
                <div>Color Boost: <span className="text-white">{gradingState.colorBoost}</span></div>
                <div>Highlights: <span className="text-white">{gradingState.highlights}</span></div>
                <div>Shadows: <span className="text-white">{gradingState.shadows}</span></div>
                <div>Split Crossover: <span className="text-white">{(gradingState.splitBalance ?? 0) > 0 ? `+${gradingState.splitBalance}` : (gradingState.splitBalance ?? 0)}</span></div>
                <div>Crossover IRE: <span className="text-indigo-300 font-semibold">{Math.round((0.5 + ((gradingState.splitBalance ?? 0) / 100) * 0.3) * 100)} IRE</span></div>
                <div className="col-span-2 pt-1 border-t border-[#1e2535] text-amber-300/90 flex justify-between">
                  <span>Standard DaVinci:</span>
                  <span className="font-semibold">Rec.709 · Gamma {gradingState.targetGamma}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Tools Section */}
        <div className="space-y-4">
          {/* Tab: Quick Starter LUTs */}
          {activeTab === 'quick-luts' && (
            <QuickStarterLuts
              currentState={gradingState}
              onApplyPreset={(newState) => setGradingState(newState)}
              onNavigateToGrading={() => setActiveTab('grading')}
              onOpenTransmit={() => setIsTransmitOpen(true)}
            />
          )}

          {/* Tab: 3-Way Color Wheels & Primary Sliders */}
          {activeTab === 'grading' && (
            <div className="space-y-6">
              {/* 4 DaVinci Resolve Wheels: Lift, Gamma, Gain, Offset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ColorWheel
                  label="Lift"
                  sublabel="Umbre (Shadows)"
                  value={gradingState.lift}
                  masterValue={gradingState.liftMaster}
                  onChange={(rgb) => updateGradingState({ lift: rgb })}
                  onMasterChange={(m) => updateGradingState({ liftMaster: m })}
                  onReset={() => updateGradingState({ lift: { r: 0, g: 0, b: 0 }, liftMaster: 0 })}
                />

                <ColorWheel
                  label="Gamma"
                  sublabel="Tonuri Medii (Midtones)"
                  value={gradingState.gamma}
                  masterValue={gradingState.gammaMaster}
                  onChange={(rgb) => updateGradingState({ gamma: rgb })}
                  onMasterChange={(m) => updateGradingState({ gammaMaster: m })}
                  onReset={() => updateGradingState({ gamma: { r: 0, g: 0, b: 0 }, gammaMaster: 0 })}
                />

                <ColorWheel
                  label="Gain"
                  sublabel="Lumini (Highlights)"
                  value={gradingState.gain}
                  masterValue={gradingState.gainMaster}
                  onChange={(rgb) => updateGradingState({ gain: rgb })}
                  onMasterChange={(m) => updateGradingState({ gainMaster: m })}
                  onReset={() => updateGradingState({ gain: { r: 1, g: 1, b: 1 }, gainMaster: 1.0 })}
                  isGain
                />

                <ColorWheel
                  label="Offset"
                  sublabel="Global (Master Shift)"
                  value={gradingState.offset}
                  masterValue={gradingState.offsetMaster}
                  onChange={(rgb) => updateGradingState({ offset: rgb })}
                  onMasterChange={(m) => updateGradingState({ offsetMaster: m })}
                  onReset={() => updateGradingState({ offset: { r: 0, g: 0, b: 0 }, offsetMaster: 0 })}
                />
              </div>

              {/* Primary Sliders */}
              <PrimarySliders
                state={gradingState}
                onChange={updateGradingState}
                onResetPrimaries={() =>
                  updateGradingState({
                    exposure: 0,
                    contrast: 1.0,
                    pivot: 0.435,
                    temperature: 0,
                    tint: 0,
                    saturation: 1.0,
                    colorBoost: 0,
                    highlights: 0,
                    shadows: 0,
                    whites: 0,
                    blacks: 0,
                    shadowTintStrength: 0,
                    highlightTintStrength: 0,
                    splitBalance: 0,
                  })
                }
              />
            </div>
          )}

          {/* Tab: RGB Curves */}
          {activeTab === 'curves' && (
            <CurvesEditor
              masterCurve={gradingState.masterCurve}
              redCurve={gradingState.redCurve}
              greenCurve={gradingState.greenCurve}
              blueCurve={gradingState.blueCurve}
              onCurveChange={handleCurveChange}
              onResetChannel={handleResetCurveChannel}
            />
          )}

          {/* Tab: HSL Qualifier */}
          {activeTab === 'hsl' && (
            <HslCurves
              hueVsHue={gradingState.hueVsHue}
              hueVsSat={gradingState.hueVsSat}
              hueVsLum={gradingState.hueVsLum}
              onChangeHueVsHue={(h) => updateGradingState({ hueVsHue: h })}
              onChangeHueVsSat={(s) => updateGradingState({ hueVsSat: s })}
              onChangeHueVsLum={(l) => updateGradingState({ hueVsLum: l })}
              onReset={() =>
                updateGradingState({
                  hueVsHue: { red: 0, yellow: 0, green: 0, cyan: 0, blue: 0, magenta: 0 },
                  hueVsSat: { red: 0, yellow: 0, green: 0, cyan: 0, blue: 0, magenta: 0 },
                  hueVsLum: { red: 0, yellow: 0, green: 0, cyan: 0, blue: 0, magenta: 0 },
                })
              }
            />
          )}

          {/* Tab: Scopes Full View */}
          {activeTab === 'scopes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Scopes getImageData={getImageData} refreshTrigger={scopesTrigger} />
              <div className="bg-[#151922] p-5 rounded-xl border border-[#232a38] space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Analiză Tonală și Gamut
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Osciloscoapele monitorizează distribuția cromatică a imaginii în timp real:
                </p>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span><strong>Waveform:</strong> Măsoară luminozitatea pe scara IRE (0 = negru absolut, 100 = alb de difuzare).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span><strong>RGB Parade:</strong> Compară individual canalele R, G, B pentru a detecta devieri de balans de alb.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span><strong>Vectorscope:</strong> Indică nuanța și saturația. Linia punctată galbenă marchează unghiul de ten uman (Skin Tone Line).</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab: DaVinci Guide */}
          {activeTab === 'guide' && <DaVinciGuide />}

          {/* Tab: Windows 11 & DaVinci Resolve Studio Integration */}
          {activeTab === 'windows' && (
            <WindowsResolveHub
              currentState={gradingState}
              onApplyPreset={(state) => setGradingState(state, 'Preset Nuntă', true)}
              onOpenTransmit={() => setIsTransmitOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        state={gradingState}
        onUpdateState={updateGradingState}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onLutImported={(parsed) => {
          updateGradingState({
            lutTitle: parsed.title,
            lutDescription: `Importat din fișier .cube (${parsed.size}x${parsed.size}x${parsed.size})`,
          });
        }}
      />

      {/* Transmit Directly to DaVinci Resolve Nodes Modal */}
      <TransmitNodesModal
        isOpen={isTransmitOpen}
        onClose={() => setIsTransmitOpen(false)}
        state={gradingState}
      />
    </div>
  );
}
