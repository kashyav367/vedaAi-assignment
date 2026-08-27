'use client';
import { forwardRef } from 'react';

interface Bbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const HighlightOverlay = forwardRef<HTMLDivElement, { bbox: Bbox; label?: string }>(
  ({ bbox, label }, ref) => {
    const formattedLabel = label
      ? label.toUpperCase().startsWith('Q')
        ? label
        : `Q${label}`
      : '';

    return (
      <div
        ref={ref}
        className="absolute border-[3px] border-[#22C55E] bg-[#22C55E]/10 rounded-2xl pointer-events-none transition-all duration-300 ring-2 ring-white/90 shadow-[0_0_20px_rgba(34,197,94,0.4)] z-20 animate-in fade-in zoom-in-95 duration-200"
        style={{
          left: `${bbox.x}%`,
          top: `${bbox.y}%`,
          width: `${bbox.width}%`,
          height: `${bbox.height}%`,
        }}
      >
        {formattedLabel && (
          <div className="absolute -top-3.5 right-4 bg-[#22C55E] text-white text-[11px] font-black px-3 py-0.5 rounded-full shadow-md flex items-center justify-center pointer-events-none z-30 ring-2 ring-white tracking-wide">
            <span>{formattedLabel} Answer</span>
          </div>
        )}
      </div>
    );
  }
);

HighlightOverlay.displayName = 'HighlightOverlay';

export default HighlightOverlay;