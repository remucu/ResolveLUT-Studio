import React, { useRef, useEffect, useState } from 'react';
import { ScopeMode } from '../types/lut';

interface ScopesProps {
  getImageData: () => ImageData | null;
  refreshTrigger: any;
}

export const Scopes: React.FC<ScopesProps> = ({ getImageData, refreshTrigger }) => {
  const [scopeMode, setScopeMode] = useState<ScopeMode>('waveform');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = getImageData();
    const w = canvas.width;
    const h = canvas.height;

    // Clear background
    ctx.fillStyle = '#0a0d13';
    ctx.fillRect(0, 0, w, h);

    if (!imgData) {
      ctx.fillStyle = '#475569';
      ctx.font = '12px monospace';
      ctx.fillText('Nicio imagine încărcată pentru analiză', 20, h / 2);
      return;
    }

    const { data, width: imgW, height: imgH } = imgData;
    // Downsample for fast responsive scopes
    const step = Math.max(1, Math.floor((imgW * imgH) / 25000));

    if (scopeMode === 'waveform') {
      // Draw DaVinci IRE Grid (0, 25, 50, 75, 100 IRE)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let ire = 0; ire <= 100; ire += 25) {
        const y = h - (ire / 100) * (h - 20) - 10;
        ctx.beginPath();
        ctx.moveTo(35, y);
        ctx.lineTo(w - 10, y);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '9px monospace';
        ctx.fillText(`${ire}`, 10, y + 3);
      }

      // Draw Luma Waveform trace
      ctx.fillStyle = 'rgba(74, 222, 128, 0.22)';
      const usableW = w - 45;
      for (let i = 0; i < data.length; i += step * 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        const pixelIdx = i / 4;
        const origX = pixelIdx % imgW;
        const mappedX = 40 + (origX / imgW) * usableW;
        const mappedY = h - lum * (h - 20) - 10;
        ctx.fillRect(mappedX, mappedY, 1.5, 1.5);
      }
    } else if (scopeMode === 'rgb_parade') {
      // 3 side-by-side columns: R, G, B
      const colW = (w - 20) / 3;
      const channels = [
        { name: 'RED', color: 'rgba(239, 68, 68, 0.3)', offset: 0, cIdx: 0 },
        { name: 'GREEN', color: 'rgba(34, 197, 94, 0.3)', offset: colW, cIdx: 1 },
        { name: 'BLUE', color: 'rgba(59, 130, 246, 0.3)', offset: colW * 2, cIdx: 2 },
      ];

      // Grid
      ctx.strokeStyle = '#1e293b';
      for (let ire = 0; ire <= 100; ire += 50) {
        const y = h - (ire / 100) * (h - 30) - 15;
        ctx.beginPath();
        ctx.moveTo(10, y);
        ctx.lineTo(w - 10, y);
        ctx.stroke();
      }

      channels.forEach((ch) => {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText(ch.name, ch.offset + 15, 15);

        ctx.fillStyle = ch.color;
        for (let i = 0; i < data.length; i += step * 4) {
          const val = data[i + ch.cIdx] / 255;
          const pixelIdx = i / 4;
          const origX = pixelIdx % imgW;
          const mappedX = ch.offset + 10 + (origX / imgW) * (colW - 20);
          const mappedY = h - val * (h - 30) - 15;
          ctx.fillRect(mappedX, mappedY, 1.2, 1.2);
        }
      });
    } else if (scopeMode === 'vectorscope') {
      // DaVinci Vectorscope
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(cx, cy) - 20;

      // Circles (75% and 100% saturation)
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 0.75, 0, Math.PI * 2);
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.stroke();

      // Skin-Tone Indicator Line (Flesh tone at ~10:30 angle or ~147 degrees)
      const skinAngle = (147 * Math.PI) / 180;
      ctx.strokeStyle = '#eab308';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(skinAngle) * maxR, cy - Math.sin(skinAngle) * maxR);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#eab308';
      ctx.font = '9px monospace';
      ctx.fillText('SKIN TONE', cx + Math.cos(skinAngle) * maxR * 0.8, cy - Math.sin(skinAngle) * maxR * 0.8 - 5);

      // Color targets (R, Mg, B, Cy, G, Yl)
      const targets = [
        { label: 'R', angle: 104, col: '#f87171' },
        { label: 'Mg', angle: 61, col: '#f472b6' },
        { label: 'B', angle: 347, col: '#60a5fa' },
        { label: 'Cy', angle: 284, col: '#22d3ee' },
        { label: 'G', angle: 241, col: '#4ade80' },
        { label: 'Yl', angle: 167, col: '#facc15' },
      ];

      targets.forEach((t) => {
        const rad = (t.angle * Math.PI) / 180;
        const tx = cx + Math.cos(rad) * maxR * 0.75;
        const ty = cy - Math.sin(rad) * maxR * 0.75;
        ctx.strokeStyle = t.col;
        ctx.strokeRect(tx - 4, ty - 4, 8, 8);
        ctx.fillStyle = t.col;
        ctx.font = '9px monospace';
        ctx.fillText(t.label, tx + 6, ty + 3);
      });

      // Plot chromaticity points
      ctx.fillStyle = 'rgba(74, 222, 128, 0.28)';
      for (let i = 0; i < data.length; i += step * 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const u = (-0.147 * r - 0.289 * g + 0.436 * b);
        const v = (0.615 * r - 0.515 * g - 0.100 * b);

        const px = cx + (u / 128) * maxR * 0.8;
        const py = cy - (v / 128) * maxR * 0.8;
        ctx.fillRect(px, py, 1.2, 1.2);
      }
    } else if (scopeMode === 'histogram') {
      const histR = new Uint32Array(256);
      const histG = new Uint32Array(256);
      const histB = new Uint32Array(256);

      for (let i = 0; i < data.length; i += 4) {
        histR[data[i]]++;
        histG[data[i + 1]]++;
        histB[data[i + 2]]++;
      }

      let maxCount = 1;
      for (let i = 0; i < 256; i++) {
        if (histR[i] > maxCount) maxCount = histR[i];
        if (histG[i] > maxCount) maxCount = histG[i];
        if (histB[i] > maxCount) maxCount = histB[i];
      }

      const drawHistChannel = (hist: Uint32Array, color: string) => {
        ctx.fillStyle = color;
        const barW = (w - 20) / 256;
        for (let i = 0; i < 256; i++) {
          const barH = (hist[i] / maxCount) * (h - 30);
          ctx.fillRect(10 + i * barW, h - barH - 10, barW, barH);
        }
      };

      drawHistChannel(histR, 'rgba(239, 68, 68, 0.4)');
      drawHistChannel(histG, 'rgba(34, 197, 94, 0.4)');
      drawHistChannel(histB, 'rgba(59, 130, 246, 0.4)');
    }
  }, [scopeMode, getImageData, refreshTrigger]);

  return (
    <div className="bg-[#151922] p-4 rounded-xl border border-[#232a38] space-y-3 shadow-md">
      <div className="flex items-center justify-between border-b border-[#212735] pb-2.5">
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Osciloscoape Video în Timp Real
        </span>
        <div className="flex items-center gap-1 p-0.5 bg-[#10141d] rounded-md border border-[#222b3b]">
          <button
            onClick={() => setScopeMode('waveform')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
              scopeMode === 'waveform' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Waveform (Luma)
          </button>
          <button
            onClick={() => setScopeMode('rgb_parade')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
              scopeMode === 'rgb_parade' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            RGB Parade
          </button>
          <button
            onClick={() => setScopeMode('vectorscope')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
              scopeMode === 'vectorscope' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vectorscope
          </button>
          <button
            onClick={() => setScopeMode('histogram')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
              scopeMode === 'histogram' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Histogramă
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-[16/9] max-h-64 bg-[#0a0d13] rounded-lg overflow-hidden border border-[#202737] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={520}
          height={260}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};
