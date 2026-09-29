import React, { useState } from 'react';
import { HslHueShift } from '../types/lut';
import { RotateCcw } from 'lucide-react';

interface HslCurvesProps {
  hueVsHue: HslHueShift;
  hueVsSat: HslHueShift;
  hueVsLum: HslHueShift;
  onChangeHueVsHue: (val: HslHueShift) => void;
  onChangeHueVsSat: (val: HslHueShift) => void;
  onChangeHueVsLum: (val: HslHueShift) => void;
  onReset: () => void;
}

const COLOR_SECTORS: { key: keyof HslHueShift; label: string; bg: string; text: string }[] = [
  { key: 'red', label: 'Roșu (Red)', bg: '#ef4444', text: 'text-rose-400' },
  { key: 'yellow', label: 'Galben (Yellow)', bg: '#eab308', text: 'text-amber-400' },
  { key: 'green', label: 'Verde (Green)', bg: '#22c55e', text: 'text-emerald-400' },
  { key: 'cyan', label: 'Cian (Cyan)', bg: '#06b6d4', text: 'text-cyan-400' },
  { key: 'blue', label: 'Albastru (Blue)', bg: '#3b82f6', text: 'text-blue-400' },
  { key: 'magenta', label: 'Magenta', bg: '#ec4899', text: 'text-pink-400' },
];

export const HslCurves: React.FC<HslCurvesProps> = ({
  hueVsHue,
  hueVsSat,
  hueVsLum,
  onChangeHueVsHue,
  onChangeHueVsSat,
  onChangeHueVsLum,
  onReset,
}) => {
  const [subTab, setSubTab] = useState<'sat' | 'hue' | 'lum'>('sat');

  const currentValues = subTab === 'sat' ? hueVsSat : subTab === 'hue' ? hueVsHue : hueVsLum;
  const currentSetter = subTab === 'sat' ? onChangeHueVsSat : subTab === 'hue' ? onChangeHueVsHue : onChangeHueVsLum;

  const handleSectorChange = (key: keyof HslHueShift, value: number) => {
    currentSetter({
      ...currentValues,
      [key]: value,
    });
  };

  return (
    <div className="bg-[#151922] p-5 rounded-xl border border-[#232a38] space-y-4 shadow-md">
      {/* Subtab Bar */}
      <div className="flex items-center justify-between border-b border-[#212735] pb-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('sat')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              subTab === 'sat'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Hue vs Sat (Saturație pe Culoare)
          </button>
          <button
            onClick={() => setSubTab('hue')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              subTab === 'hue'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Hue vs Hue (Viraj Cromatic)
          </button>
          <button
            onClick={() => setSubTab('lum')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              subTab === 'lum'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Hue vs Lum (Luminozitate Cromatică)
          </button>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          title="Resetează ajustările HSL"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset HSL</span>
        </button>
      </div>

      {/* 6 Color Sectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {COLOR_SECTORS.map((sector) => {
          const val = currentValues[sector.key] || 0;
          return (
            <div
              key={sector.key}
              className="bg-[#10141d] p-3 rounded-lg border border-[#1e2533] space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sector.bg }}
                  />
                  <span className="text-xs font-medium text-slate-200">
                    {sector.label}
                  </span>
                </div>
                <span className="font-mono text-xs tabular-nums text-amber-400">
                  {val > 0 ? `+${val}` : val}
                  {subTab === 'hue' ? '°' : '%'}
                </span>
              </div>

              <input
                type="range"
                min={subTab === 'hue' ? '-45' : '-100'}
                max={subTab === 'hue' ? '45' : '100'}
                value={val}
                onChange={(e) => handleSectorChange(sector.key, parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-[#222b3b] accent-amber-500 rounded cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{subTab === 'hue' ? '-45°' : '-100%'}</span>
                <span>0</span>
                <span>{subTab === 'hue' ? '+45°' : '+100%'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
