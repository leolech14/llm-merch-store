/**
 * Mobile Swipe Gesture Handler
 * W8: Mobile UX - Swipe-to-close gesture for modals
 */

import { useMotionValue } from 'framer-motion';

export interface SwipeGestureOptions {
  threshold?: number;
  onSwipeDown?: () => void;
}

export function useSwipeGesture(
  onSwipeDown: () => void,
  threshold = 100
) {
  const dragY = useMotionValue(0);

  const handleDragEnd = (_event: unknown, info: { offset: { y: number } }) => {
    // If dragged down more than threshold, trigger close
    if (info.offset.y > threshold) {
      onSwipeDown();
    }
  };

  return {
    dragY,
    onDragEnd: handleDragEnd,
    dragConstraints: { top: 0, bottom: 300 },
    dragElastic: 0.2,
  };
}
