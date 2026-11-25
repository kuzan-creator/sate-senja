// Mouse and keyboard input, read in canvas coordinates (the renderer scales
// the 1280x800 field to the window, so clicks are mapped back through it).
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_SERVE = 4;

export function createInput(canvas) {
  const keys = new Set();
  const clicks = [];
  let actions = 0;

  function toLocal(event) {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / 1280, rect.height / 800);
    const ox = (rect.width - 1280 * scale) / 2;
    const oy = (rect.height - 800 * scale) / 2;
    return {
      x: (event.clientX - rect.left - ox) / scale,
      y: (event.clientY - rect.top - oy) / scale,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    clicks.push(toLocal(event));
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    keys.add(event.key.toLowerCase());
    if (event.key === ' ' || event.key === 'Enter') {
      actions |= ACTION_CONFIRM;
      event.preventDefault();
    }
    if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') actions |= ACTION_PAUSE;
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));

  return {
    /** Clicks since the last read, in field coordinates. */
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
    /** One-shot actions (confirm / pause / serve) since the last read. */
    takeActions() {
      const out = actions;
      actions = 0;
      return out;
    },
    /** True while the key is held down (single letters, lowercased). */
    held(key) {
      return keys.has(key);
    },
    /** True if the key was pressed since the last read; consumes it. */
    pressed(key) {
      if (!keys.has(key)) return false;
      keys.delete(key);
      return true;
    },
  };
}
