// Tiny WebAudio bleeps only: no audio files, no network. The context is
// created lazily on the first user gesture, so autoplay rules never block it.
let ctx = null;

function audio() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    return ctx;
  } catch {
    return null;
  }
}

function blip(freq, dur, type, vol, when = 0) {
  const ac = audio();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ac.currentTime + when);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + when + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime + when);
    osc.stop(ac.currentTime + when + dur);
  } catch {
    // Sound is garnish: a blocked context never breaks the game.
  }
}

/** A soft sizzle tick when a skewer hits the grill or is flipped. */
export function sizzleSound() {
  blip(220, 0.08, 'sawtooth', 0.05);
  blip(330, 0.06, 'triangle', 0.04, 0.03);
}

/** A bright ding when a plate is served and coins land. */
export function serveSound() {
  blip(660, 0.12, 'sine', 0.12);
  blip(880, 0.16, 'sine', 0.12, 0.09);
  blip(1320, 0.2, 'sine', 0.08, 0.18);
}

/** A low buzz when a skewer burns or a customer walks away. */
export function burntSound() {
  blip(140, 0.25, 'square', 0.08);
  blip(110, 0.3, 'square', 0.06, 0.08);
}

/** A click for picking up ingredients and sauce. */
export function clickSound() {
  blip(520, 0.05, 'triangle', 0.07);
}

/** The bell when a new order ticket lands on the board. */
export function orderSound() {
  blip(980, 0.1, 'sine', 0.1);
  blip(1240, 0.14, 'sine', 0.09, 0.1);
}
