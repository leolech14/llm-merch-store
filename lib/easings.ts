/**
 * Custom Easing Functions - LLMMerch Brand Animation
 *
 * Philosophy: Slow start → Max speed at 2/3 → Abrupt slow down
 * Used throughout the site (modals, sidebar, zoom, transitions)
 */

/**
 * LLMMerch Signature Easing
 *
 * Characteristics:
 * - Starts VERY slow (ease-in)
 * - Accelerates to max speed at ~66% (2/3 of animation)
 * - Abrupt deceleration at end
 *
 * Cubic bezier: [0.2, 0, 0.8, 1]
 * Similar to: anticipate easing but smoother
 */
export const llmmerchEasing = [0.2, 0, 0.8, 1] as const;

/**
 * Alternative: Even more pronounced
 * Starts VERY slow, explosive middle, hard brake
 */
export const llmmerchEasingAggressive = [0.1, 0, 0.9, 1] as const;

/**
 * For exits/closing animations
 * Mirror of entrance but reversed
 */
export const llmmerchEasingExit = [0.8, 0, 0.2, 1] as const;

/**
 * Spring config matching the easing feel
 * Use for draggable elements
 */
export const llmmerchSpring = {
  type: "spring" as const,
  damping: 25,
  stiffness: 400,
  mass: 0.8,
};

/**
 * For smooth zoom animations
 * Slightly softer than signature
 * Duration: 2x longer for smooth feel
 */
export const llmmerchZoom = {
  type: "spring" as const,
  damping: 30,
  stiffness: 200,
  mass: 1.5,
};

/**
 * Complete transition configs (ready to spread)
 */
export const TRANSITIONS = {
  // Standard entrance (modals, sheets, popups) - 2x longer
  entrance: {
    duration: 1.0,
    ease: llmmerchEasing,
  },

  // Exit animations - 2x longer
  exit: {
    duration: 0.8,
    ease: llmmerchEasingExit,
  },

  // Zoom interactions - 2x longer
  zoom: llmmerchZoom,

  // Sidebar/Sheet slides - 2x longer
  slide: {
    type: "spring" as const,
    damping: 35,
    stiffness: 250,
  },

  // Quick interactions (buttons, hovers) - 2x longer
  quick: {
    duration: 0.4,
    ease: llmmerchEasing,
  },

  // Slow reveals (hero sections) - 2x longer
  reveal: {
    duration: 1.6,
    ease: llmmerchEasing,
  },
} as const;

/**
 * CSS easing for non-Framer Motion animations
 */
export const CSS_EASINGS = {
  signature: 'cubic-bezier(0.2, 0, 0.8, 1)',
  aggressive: 'cubic-bezier(0.1, 0, 0.9, 1)',
  exit: 'cubic-bezier(0.8, 0, 0.2, 1)',
} as const;

/**
 * Export everything
 */
export default {
  llmmerchEasing,
  llmmerchEasingAggressive,
  llmmerchEasingExit,
  llmmerchSpring,
  llmmerchZoom,
  TRANSITIONS,
  CSS_EASINGS,
};
