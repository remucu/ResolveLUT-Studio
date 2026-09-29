import React, { useRef, useState, useCallback, useEffect } from 'react';
import { RGBVec } from '../types/lut';
import { RotateCcw } from 'lucide-react';

interface ColorWheelProps {
  label: string;
  sublabel: string;
  value: RGBVec;
  masterValue: number;
  onChange: (rgb: RGBVec) => void;
  onMasterChange: (master: number) => void;
  onReset: () => void;
  isGain?: boolean;
}

export const ColorWheel: React.FC<ColorWheelProps> = ({
  label,
  sublabel,
  value,
  masterValue,
  onChange,
  onMasterChange,
  onReset,
  isGain = false,
}) => {
  const diskRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convert RGB shift to disc coordinates (x, y between -1 and 1)
  // For Lift/Gamma/Offset: value.r, value.b around 0
  // For Gain: value.r, value.b around 1.0
  let normR = isGain ? value.r - 1.0 : value.r;
  let normG = isGain ? value.g - 1.0 : value.g;
  let normB = isGain ? value.b - 1.0 : value.b;

  // Approximate 2D projection on chromaticity circle:
  // Angle: Red is right-up (~30 deg), Green is top-left (~150 deg), Blue is bottom (~270 deg)
  const angleR = (30 * Math.PI) / 180;
  const angleG = (150 * Math.PI) / 180;
  const angleB = (270 * Math.PI) / 180;

  const posX = normR * Math.cos(angleR) + normG * Math.cos(angleG) + normB * Math.cos(angleB);
  const posY = normR * Math.sin(angleR) + normG * Math.sin(angleG) + normB * Math.sin(angleB);

  // Disc radius is 60px
  const radius = 54;
  const handleX = Math.max(-radius, Math.min(radius, posX * radius * 4));
  const handleY = Math.max(-radius, Math.min(radius, posY * radius * 4));

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    updateFromPointer(e.clientX, e.clientY);
  };

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!diskRef.current) return;
      const rect = diskRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let dx = clientX - centerX;
      let dy = clientY - centerY;

      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) {
        dx = (dx / dist) * radius;
        dy = (dy / dist) * radius;
      }

      // Convert (dx, dy) back to normalized [-1, 1]
      const nx = dx / radius;
      const ny = dy / radius;

      // Project back to RGB weights
      // Angle theta
      const angle = Math.atan2(dy, dx);
      const intensity = dist / radius; // 0 to 1

      // DaVinci RGB projection
      const rWeight = Math.cos(angle - angleR) * intensity * 0.25;
      const gWeight = Math.cos(angle - angleG) * intensity * 0.25;
      const bWeight = Math.cos(angle - angleB) * intensity * 0.25;

      if (isGain) {
        onChange({
          r: Math.max(0.5, Math.min(2.0, 1.0 + rWeight)),
          g: Math.max(0.5, Math.min(2.0, 1.0 + gWeight)),
          b: Math.max(0.5, Math.min(2.0, 1.0 + bWeight)),
        });
      } else {
        onChange({
          r: Math.max(-0.5, Math.min(0.5, rWeight)),
          g: Math.max(-0.5, Math.min(0.5, gWeight)),
          b: Math.max(-0.5, Math.min(0.5, bWeight)),
        });
      }
    },
    [isGain, onChange]
  );

  useEffect(() => {
    if (!isDragging) return;
    const onPointerMove = (e: PointerEvent) => {
      updateFromPointer(e.clientX, e.clientY);
    };
    const onPointerUp = () => {
      setIsDragging(false);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isDragging, updateFromPointer]);

  return (
    <div className="flex flex-col items-center bg-[#151922] p-4 rounded-xl border border-[#212836] select-none shadow-md">
      {/* Title & Reset Button */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white tracking-wide uppercase">
            {label}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {sublabel}
          </span>
        </div>
        <button
          onClick={onReset}
          title="Resetează roata la valori neutre"
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#202736] transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Circular Color Disc */}
      <div
        ref={diskRef}
        onPointerDown={handlePointerDown}
        className="relative w-36 h-36 rounded-full cursor-crosshair flex items-center justify-center border border-[#303a4e] shadow-inner overflow-hidden"
        style={{
          background:
            'radial-gradient(circle, #2d3748 0%, rgba(20,25,35,0.9) 70%, #0d1117 100%)',
        }}
      >
        {/* Subtle Hue Ring Overlay */}
        <div
          className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
          style={{
            background:
              'conic-gradient(from 90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
            maskImage: 'radial-gradient(circle, transparent 40%, black 85%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 40%, black 85%)',
          }}
        />

        {/* Crosshair guidelines */}
        <div className="absolute w-full h-[1px] bg-slate-700/50 pointer-events-none" />
        <div className="absolute h-full w-[1px] bg-slate-700/50 pointer-events-none" />
        <div className="absolute w-14 h-14 rounded-full border border-slate-700/40 pointer-events-none" />

        {/* Draggable Indicator Handle */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{
            left: `calc(50% + ${handleX}px)`,
            top: `calc(50% + ${handleY}px)`,
            backgroundColor: isGain
              ? `rgb(${Math.round(value.r * 180)}, ${Math.round(value.g * 180)}, ${Math.round(value.b * 180)})`
              : `rgb(${Math.round((value.r + 0.5) * 255)}, ${Math.round((value.g + 0.5) * 255)}, ${Math.round((value.b + 0.5) * 255)})`,
          }}
        />
      </div>

      {/* RGB Values Readout */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono mt-3 px-1 text-slate-400">
        <div>
          R: <span className="text-rose-400">{value.r.toFixed(2)}</span>
        </div>
        <div>
          G: <span className="text-emerald-400">{value.g.toFixed(2)}</span>
        </div>
        <div>
          B: <span className="text-sky-400">{value.b.toFixed(2)}</span>
        </div>
      </div>

      {/* Master Brightness / Luma Wheel (DaVinci Horizontal Dial) */}
      <div className="w-full mt-3 pt-2.5 border-t border-[#1f2635] space-y-1">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-slate-400">Master Dial</span>
          <span className="text-amber-400 tabular-nums">
            {masterValue.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={isGain ? '0.5' : '-0.5'}
          max={isGain ? '1.8' : '0.5'}
          step="0.01"
          value={masterValue}
          onChange={(e) => onMasterChange(parseFloat(e.target.value))}
          className="w-full h-1.5 accent-amber-500 bg-[#252f42] rounded cursor-pointer"
        />
      </div>
    </div>
  );
};
