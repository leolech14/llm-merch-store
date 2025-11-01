"use client";

/**
 * Header Cart Button
 * Shows cart item count, opens drawer on click
 * Follows strict B&W minimal design system
 */
interface HeaderCartProps {
  itemCount: number;
  onClick: () => void;
}

export function HeaderCart({ itemCount, onClick }: HeaderCartProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-white text-black font-black hover:bg-white/90 transition-colors"
      aria-label={`Cart with ${itemCount} items`}
    >
      <span className="text-sm">🛒</span>
      {itemCount > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-lg font-mono">{itemCount}</span>
          <span className="text-xs uppercase tracking-wider">ITEMS</span>
        </div>
      )}
      {itemCount === 0 && (
        <span className="text-xs uppercase tracking-wider">CART</span>
      )}
    </button>
  );
}
