'use client';

interface Bbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function HighlightOverlay({ bbox, label }: { bbox: Bbox; label?: string }) {
  const formattedLabel = label ? (label.startsWith('Q') ? label : `Q${label}`) : '';

  return (
    <div
      className="absolute border-[3px] border-[#22C55E] bg-[#22C55E]/10 rounded-2xl pointer-events-none transition-all duration-300 ring-2 ring-white/90 shadow-[0_0_15px_rgba(34,197,94,0.3)] z-20"
      style={{
        left: `${bbox.x}%`,
        top: `${bbox.y}%`,
        width: `${bbox.width}%`,
        height: `${bbox.height}%`,
      }}
    >
      {formattedLabel && (
        <div className="absolute -top-[28px] -left-[3px] bg-[#22C55E] text-white text-xs font-black px-3.5 py-1 rounded-t-xl rounded-br-lg shadow-md flex items-center justify-center pointer-events-none z-30 ring-2 ring-white/90">
          <span className="underline decoration-white/80 underline-offset-2">{formattedLabel}</span>
        </div>
      )}
    </div>
  );
}