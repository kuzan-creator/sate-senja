// The world: orders, grill, plating, coins and the shift clock. Pure rules,
// no drawing here. A skewer cooks in stages: raw -> cooking -> FLIP! ->
// cooking -> PERFECT (click to plate it) -> burnt (click to bin it).
import {
  CUSTOMERS,
  GRILL,
  MAX_ORDERS,
  MENU,
  ORDER_EVERY,
  ORDER_EVERY_LATE,
  PATIENCE,
  SHIFT_SECONDS,
} from './config.js';
import { burntSound, clickSound, orderSound, serveSound, sizzleSound } from './audio.js';

export const EVENT_ORDER = 1;
export const EVENT_SERVED = 2;
export const EVENT_LOST = 4;
export const EVENT_OVER = 8;

let orderId = 0;

function makeOrder(random) {
  const dish = random.pick(MENU);
  const who = random.pick(CUSTOMERS);
  orderId += 1;
  return {
    id: orderId,
    name: dish.name,
    customer: who,
    ayam: dish.ayam,
    kambing: dish.kambing,
    sauce: dish.sauce,
    lontong: dish.lontong,
    drink: dish.drink,
    price: dish.price,
    patience: 1,
    maxSeconds: PATIENCE,
    secondsLeft: PATIENCE,
    served: false,
    leaving: false,
  };
}

/** True when the plate holds exactly what the order asks for. */
export function plateMatches(plate, order) {
  return (
    plate.ayam === order.ayam &&
    plate.kambing === order.kambing &&
    plate.sauce === order.sauce &&
    plate.lontong === order.lontong &&
    plate.drink === order.drink
  );
}

/** True when the plate holds at least one thing (so Serve is not empty). */
export function plateHasFood(plate) {
  return plate.ayam + plate.kambing + plate.sauce + plate.lontong + plate.drink > 0;
}

export function createWorld(random) {
  const state = {
    timeLeft: SHIFT_SECONDS,
    coins: 0,
    combo: 0,
    served: 0,
    lost: 0,
    orders: [],
    grill: Array.from({ length: GRILL.slots }, () => ({ kind: null, t: 0, flipped: false })),
    plate: { ayam: 0, kambing: 0, sauce: 0, lontong: 0, drink: 0 },
    tray: { ayam: 99, kambing: 99 },
    selectedKind: 'ayam',
    orderTimer: 6,
    toast: '',
    toastT: 0,
    fx: [],
    time: 0,
    lastServedHappy: false,
    happyT: 0,
  };

  function say(text, seconds = 2) {
    state.toast = text;
    state.toastT = seconds;
  }

  function spawnOrder() {
    if (state.orders.length >= MAX_ORDERS) return;
    state.orders.push(makeOrder(random));
    orderSound();
  }

  function reset() {
    state.timeLeft = SHIFT_SECONDS;
    state.coins = 0;
    state.combo = 0;
    state.served = 0;
    state.lost = 0;
    state.orders = [];
    state.grill = Array.from({ length: GRILL.slots }, () => ({ kind: null, t: 0, flipped: false }));
    state.plate = { ayam: 0, kambing: 0, sauce: 0, lontong: 0, drink: 0 };
    state.tray = { ayam: 99, kambing: 99 };
    state.selectedKind = 'ayam';
    state.orderTimer = 6;
    state.toast = 'Welcome to Sate Senja! Grill, sauce, plate, serve!';
    state.toastT = 3;
    state.fx = [];
    state.time = 0;
    state.lastServedHappy = false;
    state.happyT = 0;
    spawnOrder();
    spawnOrder();
  }

  /** Grill slot stage: empty, raw, cooking, flip, perfect or burnt. */
  function slotStage(slot) {
    if (!slot.kind) return 'empty';
    if (slot.t >= GRILL.burntAt) return 'burnt';
    if (!slot.flipped && slot.t >= GRILL.flipAt) return 'flip';
    if (slot.flipped && slot.t >= GRILL.perfectAt) return 'perfect';
    return 'cooking';
  }

  /** Click a grill slot: place, flip, plate a perfect skewer, or bin a burnt one. */
  function clickGrill(index) {
    const slot = state.grill[index];
    const stage = slotStage(slot);
    if (stage === 'empty') {
      slot.kind = state.selectedKind;
      slot.t = 0;
      slot.flipped = false;
      sizzleSound();
      return;
    }
    if (stage === 'flip') {
      slot.flipped = true;
      sizzleSound();
      state.fx.push({ x: 240 + index * 105, y: 300, text: 'FLIPPED!', life: 1, color: '#43aa4b' });
      return;
    }
    if (stage === 'perfect') {
      state.plate[slot.kind] += 1;
      state.grill[index] = { kind: null, t: 0, flipped: false };
      clickSound();
      state.fx.push({ x: 640, y: 420, text: '+1 skewer on the plate', life: 1, color: '#2c7a32' });
      return;
    }
    if (stage === 'burnt') {
      state.grill[index] = { kind: null, t: 0, flipped: false };
      burntSound();
      say('Burnt! That skewer went in the bin.');
      return;
    }
    say('Still cooking — wait for the green glow, then flip!');
  }

  function addToPlate(what) {
    const cap = { sauce: 1, lontong: 1, drink: 1 };
    if (state.plate[what] >= (cap[what] ?? 9)) {
      say(`Already got ${what} on the plate.`);
      return;
    }
    state.plate[what] += 1;
    clickSound();
  }

  /** Serve the first order the plate matches; returns its tip in coins. */
  function serve() {
    if (!plateHasFood(state.plate)) {
      say('The plate is empty — grill something first!');
      return 0;
    }
    const order = state.orders.find((o) => plateMatches(state.plate, o));
    if (!order) {
      say("No order matches this plate — check the tickets!");
      state.combo = 0;
      return 0;
    }
    const tip = Math.max(1, Math.round(order.price * order.patience * 0.5));
    const earned = order.price + tip;
    state.coins += earned;
    state.combo += 1;
    state.served += 1;
    order.served = true;
    state.orders = state.orders.filter((o) => o !== order);
    state.plate = { ayam: 0, kambing: 0, sauce: 0, lontong: 0, drink: 0 };
    serveSound();
    state.lastServedHappy = true;
    state.happyT = 3;
    state.fx.push({ x: 640, y: 300, text: `+$${earned}  (tip $${tip})`, life: 1.6, color: '#2c7a32' });
    say(`${order.customer.name} loved it! Combo x${state.combo}`);
    return earned;
  }

  /**
   * One fixed step. Clicks are {x, y} in field coordinates; keys is the input
   * helper. Returns an event bitmask (served / lost / over / new order).
   */
  function step(dt, clicks, input) {
    let events = 0;
    state.time += dt;
    if (state.toastT > 0) state.toastT -= dt;
    if (state.happyT > 0) {
      state.happyT -= dt;
      if (state.happyT <= 0) state.lastServedHappy = false;
    }
    for (const f of state.fx) f.life -= dt * 0.8;
    state.fx = state.fx.filter((f) => f.life > 0);

    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      return events | EVENT_OVER;
    }

    // New walk-up customers, faster as the shift wears on.
    state.orderTimer -= dt;
    if (state.orderTimer <= 0) {
      spawnOrder();
      events |= EVENT_ORDER;
      const late = state.timeLeft < SHIFT_SECONDS / 2;
      state.orderTimer = late ? ORDER_EVERY_LATE : ORDER_EVERY;
    }

    // Grill cooks; patience drains.
    for (const slot of state.grill) {
      if (slot.kind && slotStage(slot) !== 'burnt') slot.t += dt;
      else if (slot.kind) slot.t += dt;
    }
    for (const order of state.orders) {
      order.secondsLeft -= dt;
      order.patience = Math.max(0, order.secondsLeft / order.maxSeconds);
    }
    const walked = state.orders.filter((o) => o.secondsLeft <= 0);
    if (walked.length > 0) {
      state.orders = state.orders.filter((o) => o.secondsLeft > 0);
      state.lost += walked.length;
      state.combo = 0;
      burntSound();
      say(`${walked[0].customer.name} walked away hungry! Combo lost.`);
      events |= EVENT_LOST;
    }

    // Keyboard shortcuts.
    if (input) {
      if (input.pressed('1')) clickGrill(0);
      if (input.pressed('2')) clickGrill(1);
      if (input.pressed('3')) clickGrill(2);
      if (input.pressed('4')) clickGrill(3);
      if (input.pressed('s')) addToPlate('sauce');
      if (input.pressed('l')) addToPlate('lontong');
      if (input.pressed('d')) addToPlate('drink');
      if (input.pressed('a')) { state.selectedKind = 'ayam'; clickSound(); }
      if (input.pressed('k')) { state.selectedKind = 'kambing'; clickSound(); }
      if (input.pressed(' ')) {
        if (serve() > 0) events |= EVENT_SERVED;
      }
    }

    // Mouse clicks, routed by the hit zones the renderer draws.
    for (const c of clicks) {
      const g = hitGrill(c);
      if (g >= 0) { clickGrill(g); continue; }
      const trayKind = hitTray(c);
      if (trayKind) { state.selectedKind = trayKind; clickSound(); continue; }
      if (hitSauce(c)) { addToPlate('sauce'); continue; }
      if (hitLontong(c)) { addToPlate('lontong'); continue; }
      if (hitDrink(c)) { addToPlate('drink'); continue; }
      if (hitServe(c)) {
        if (serve() > 0) events |= EVENT_SERVED;
        continue;
      }
      const ticket = hitTicket(c);
      if (ticket) {
        if (serve() > 0) events |= EVENT_SERVED;
        continue;
      }
    }
    return events;
  }

  return { state, reset, step, slotStage, serve, spawnOrder, clickGrill, addToPlate, say };
}

// --- Hit zones, shared with the renderer (same numbers, one source of truth
// for the layout would be nicer, but the renderer mirrors these exactly). ---
export const ZONES = {
  grill: { x: 56, y: 312, w: 100, h: 120, gap: 8 },
  trayAyam: { x: 56, y: 520, w: 190, h: 92 },
  trayKambing: { x: 262, y: 520, w: 190, h: 92 },
  sauce: { x: 500, y: 470, w: 130, h: 130 },
  lontong: { x: 646, y: 470, w: 130, h: 130 },
  drink: { x: 860, y: 250, w: 380, h: 150 },
  serve: { x: 560, y: 620, w: 180, h: 56 },
  tickets: { x: 16, y: 74, w: 296, h: 100, gap: 10 },
};

function inZone(c, z) {
  return c.x >= z.x && c.x <= z.x + z.w && c.y >= z.y && c.y <= z.y + z.h;
}

export function hitGrill(c) {
  for (let i = 0; i < GRILL.slots; i += 1) {
    const z = { x: ZONES.grill.x + i * (ZONES.grill.w + ZONES.grill.gap), y: ZONES.grill.y, w: ZONES.grill.w, h: ZONES.grill.h };
    if (inZone(c, z)) return i;
  }
  return -1;
}

export function hitTray(c) {
  if (inZone(c, ZONES.trayAyam)) return 'ayam';
  if (inZone(c, ZONES.trayKambing)) return 'kambing';
  return null;
}

export function hitSauce(c) { return inZone(c, ZONES.sauce); }
export function hitLontong(c) { return inZone(c, ZONES.lontong); }
export function hitDrink(c) { return inZone(c, ZONES.drink); }
export function hitServe(c) { return inZone(c, ZONES.serve); }

export function hitTicket(c) {
  const z = ZONES.tickets;
  for (let i = 0; i < MAX_ORDERS; i += 1) {
    const t = { x: z.x + i * (z.w + z.gap), y: z.y, w: z.w, h: z.h };
    if (inZone(c, t)) return i;
  }
  return -1;
}
