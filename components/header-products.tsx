"use client";

/**
 * Header Product Count
 * Shows available/total in minimal B&W style
 */
interface HeaderProductsProps {
  available: number;
  total: number;
}

export function HeaderProducts({ available, total }: HeaderProductsProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white/10 border border-white/30">
      <div className="flex flex-col items-end">
        <div className="text-2xl font-black text-white font-mono leading-none">
          {available}
        </div>
        <div className="text-xs text-white/40 font-mono">
          / {total}
        </div>
      </div>
      <div className="text-xs text-white/50 uppercase tracking-widest font-bold">
        LEFT
      </div>
    </div>
  );
}
