"use client";

/**
 * Header Visitor Count
 * Clean minimal component matching site design
 */
interface HeaderVisitorProps {
  count: number;
}

export function HeaderVisitor({ count }: HeaderVisitorProps) {
  return (
    <div className="flex flex-col items-center px-4 py-2 border-2 border-white/40">
      <div className="text-3xl font-black text-white font-mono">
        {count.toLocaleString()}
      </div>
      <div className="text-xs text-white/50 uppercase tracking-widest font-bold">
        WATCHING
      </div>
    </div>
  );
}
