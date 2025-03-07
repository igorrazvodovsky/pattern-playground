
export function animateTo(el: HTMLElement, keyframes: Keyframe[], options?: KeyframeAnimationOptions) {

  return new Promise(resolve => {
    if (options?.duration === Infinity) {
      throw new Error('Promise-based animations must be finite.');
    }

    const animation = el.animate(keyframes, {
      ...options,
      duration: prefersReducedMotion() ? 0 : options!.duration
    });

    animation.addEventListener('cancel', resolve, { once: true });
    animation.addEventListener('finish', resolve, { once: true });
  });
}

export function parseDuration(delay: number | string) {
  delay = delay.toString().toLowerCase();

  if (delay.indexOf('ms') > -1) {
    return parseFloat(delay);
  }

  if (delay.indexOf('s') > -1) {
    return parseFloat(delay) * 1000;
  }

  return parseFloat(delay);
}

export function prefersReducedMotion() {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  return query.matches;
}

export function stopAnimations(el: HTMLElement) {
  return Promise.all(
    el.getAnimations().map(animation => {
      return new Promise(resolve => {
        animation.cancel();
        requestAnimationFrame(resolve);
      });
    })
  );
}

/**
 * We can't animate `height: auto`, but we can calculate the height and shim keyframes by replacing it with the
 * element's scrollHeight before the animation.
 */
export function shimKeyframesHeightAuto(keyframes: Keyframe[], calculatedHeight: number) {
  return keyframes.map(keyframe => ({
    ...keyframe,
    height: keyframe.height === 'auto' ? `${calculatedHeight}px` : keyframe.height
  }));
}