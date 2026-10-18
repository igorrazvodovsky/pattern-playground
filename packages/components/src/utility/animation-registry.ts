export interface ElementAnimation {
  keyframes: Keyframe[];
  options?: KeyframeAnimationOptions;
}

const defaultAnimationRegistry = new Map<string, ElementAnimation>();

function ensureAnimation(animation: ElementAnimation | null) {
  return animation ?? { keyframes: [], options: { duration: 0 } };
}

/**
 * Sets a default animation. Components should use the `name.animation` for primary animations and `name.part.animation`
 * for secondary animations, e.g. `dialog.show` and `dialog.overlay.show`. For modifiers, use `drawer.showTop`.
 */
export function setDefaultAnimation(animationName: string, animation: ElementAnimation | null) {
  defaultAnimationRegistry.set(animationName, ensureAnimation(animation));
}

/** Gets a registered animation by name. Falls back to an empty animation if none is registered. */
export function getAnimation(animationName: string) {
  // Check for a default animation
  const defaultAnimation = defaultAnimationRegistry.get(animationName);
  if (defaultAnimation) {
    return defaultAnimation;
  }

  // Fall back to an empty animation
  return {
    keyframes: [],
    options: { duration: 0 }
  };
}