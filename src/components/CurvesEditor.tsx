import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CurvePoint } from '../types/lut';
import { MonotoneCubicSpline } from '../utils/colorScience';
import { RotateCcw, Plus, Trash2 } from 'lucide-react';

interface CurvesEditorProps {
  masterCurve: CurvePoint[];
  redCurve: CurvePoint[];
  greenCurve: CurvePoint[];
  blueCurve: CurvePoint[];
  onCurveChange: (channel: 'master' | 'red' | 'green' | 'blue', points: CurvePoint[]) => void;
  onResetChannel: (channel: 'master' | 'red' | 'green' | 'blue') => void;
}

export const CurvesEditor: React.FC<CurvesEditorProps> = ({
  masterCurve,
  redCurve,
  greenCurve,
  blueCurve,
  onCurveChange,
  onResetChannel,
}) => {
  const [activeChannel, setActiveChannel] = useState<'master' | 'red' | 'green' | 'blue'>('master');
  const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const currentPoints =
    activeChannel === 'master'
      ? masterCurve
      : activeChannel === 'red'
      ? redCurve
      : activeChannel === 'green'
      ? greenCurve
      : blueCurve;

  const channelColor =
    activeChannel === 'master'
      ? '#f8fafc'
      : activeChannel === 'red'
      ? '#f87171'
      : activeChannel === 'green'
      ? '#4ade80'
      : '#60a5fa';

  // Compute SVG path string from spline
  const getCurvePath = (points: CurvePoint[]): string => {
    const spline = new MonotoneCubicSpline(points);
    const numSamples = 60;
    const pathParts: string[] = [];

    for (let i = 0; i <= numSamples; i++) {
      const x = i / numSamples;
      const y = spline.evaluate(x);
      // In SVG: x=0 is left, y=0 is bottom (so SVG y is (1 - y) * 260)
      const svgX = x * 260;
      const svgY = (1 - y) * 260;
      if (i === 0) {
        pathParts.push(`M ${svgX.toFixed(1)} ${svgY.toFixed(1)}`);
      } else {
        pathParts.push(`L ${svgX.toFixed(1)} ${svgY.toFixed(1)}`);
      }
    }

    return pathParts.join(' ');
  };

  const handlePointerDown = (index: number, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggedPointIndex(index);
  };

  const handleSvgDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));

    // Don't add if too close to existing point
    if (currentPoints.some((p) => Math.abs(p.x - x) < 0.05)) return;

    const newPoints = [...currentPoints, { x, y }].sort((a, b) => a.x - b.x);
    onCurveChange(activeChannel, newPoints);
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (draggedPointIndex === null || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      let x = (e.clientX - rect.left) / rect.width;
      let y = 1 - (e.clientY - rect.top) / rect.height;

      x = Math.max(0, Math.min(1, x));
      y = Math.max(0, Math.min(1, y));

      const updated = [...currentPoints];

      // Endpoints stay at x=0 or x=1
      if (draggedPointIndex === 0) {
        x = 0;
      } else if (draggedPointIndex === updated.length - 1) {
        x = 1;
      } else {
        // Keep strictly ordered in X
        const prevX = updated[draggedPointIndex - 1].x + 0.01;
        const nextX = updated[draggedPointIndex + 1].x - 0.01;
        x = Math.max(prevX, Math.min(nextX, x));
      }

      updated[draggedPointIndex] = { x, y };
      onCurveChange(activeChannel, updated);
    },
    [draggedPointIndex, currentPoints, activeChannel, onCurveChange]
  );

  const handlePointerUp = useCallback(() => {
    setDraggedPointIndex(null);
  }, []);

  useEffect(() => {
    if (draggedPointIndex !== null) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [draggedPointIndex, handlePointerMove, handlePointerUp]);

  const handleDeletePoint = (index: number) => {
    if (index === 0 || index === currentPoints.length - 1) return;
    const updated = currentPoints.filter((_, i) => i !== index);
    onCurveChange(activeChannel, updated);
  };

  return (
    <div className="bg-[#151922] p-5 rounded-xl border border-[#232a38] space-y-4 shadow-md">
      {/* Channel Tabs */}
      <div className="flex items-center justify-between border-b border-[#212735] pb-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveChannel('master')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeChannel === 'master'
                ? 'bg-slate-700/80 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Master (Y)
          </button>
          <button
            onClick={() => setActiveChannel('red')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeChannel === 'red'
                ? 'bg-rose-950/70 text-rose-300 border border-rose-800/50'
                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
            }`}
          >
            Roșu (R)
          </button>
          <button
            onClick={() => setActiveChannel('green')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeChannel === 'green'
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
            }`}
          >
            Verde (G)
          </button>
          <button
            onClick={() => setActiveChannel('blue')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeChannel === 'blue'
                ? 'bg-sky-950/70 text-sky-300 border border-sky-800/50'
                : 'text-slate-400 hover:text-sky-400 hover:bg-slate-800'
            }`}
          >
            Albastru (B)
          </button>
        </div>

        <button
          onClick={() => onResetChannel(activeChannel)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          title="Resetează curba curentă"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Interactive SVG Curve Workspace */}
      <div className="relative w-full max-w-sm mx-auto aspect-square bg-[#0e1117] rounded-lg border border-[#2b3548] p-2 overflow-hidden shadow-inner select-none">
        {/* DaVinci Grid Background (4x4) */}
        <div className="absolute inset-2 grid grid-cols-4 grid-rows-4 pointer-events-none">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="border-r border-b border-slate-800/60" />
          ))}
        </div>
        {/* Diagonal 45-degree reference line */}
        <svg className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] pointer-events-none">
          <line x1="0" y1="100%" x2="100%" y2="0" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
        </svg>

        {/* Ghost Curves for other channels */}
        <svg className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] pointer-events-none" viewBox="0 0 260 260">
          {activeChannel !== 'master' && (
            <path d={getCurvePath(masterCurve)} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          )}
          {activeChannel !== 'red' && (
            <path d={getCurvePath(redCurve)} fill="none" stroke="rgba(239,68,68,0.2)" strokeWidth="1" />
          )}
          {activeChannel !== 'green' && (
            <path d={getCurvePath(greenCurve)} fill="none" stroke="rgba(34,197,94,0.2)" strokeWidth="1" />
          )}
          {activeChannel !== 'blue' && (
            <path d={getCurvePath(blueCurve)} fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="1" />
          )}
        </svg>

        {/* Main Active Channel SVG */}
        <svg
          ref={svgRef}
          onDoubleClick={handleSvgDoubleClick}
          className="relative w-full h-full cursor-crosshair"
          viewBox="0 0 260 260"
        >
          {/* Active Interpolated Spline */}
          <path
            d={getCurvePath(currentPoints)}
            fill="none"
            stroke={channelColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Control Points */}
          {currentPoints.map((pt, idx) => {
            const cx = pt.x * 260;
            const cy = (1 - pt.y) * 260;
            const isEndpoint = idx === 0 || idx === currentPoints.length - 1;

            return (
              <g key={idx}>
                {/* Hit area */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="12"
                  fill="transparent"
                  onPointerDown={(e) => handlePointerDown(idx, e)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleDeletePoint(idx);
                  }}
                  className="cursor-pointer"
                />
                {/* Visual circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isEndpoint ? '5' : '6'}
                  fill={draggedPointIndex === idx ? '#fbbf24' : channelColor}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="pointer-events-none transition-colors"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Instructions & Coordinate Readout */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div>
          <span>Dublu-clic: adaugă punct</span>
          <span className="mx-1.5 text-slate-600">·</span>
          <span>Clic dreapta: șterge punct</span>
        </div>
        <div className="text-slate-300">
          Puncte: <span className="text-amber-400">{currentPoints.length}</span>
        </div>
      </div>
    </div>
  );
};
