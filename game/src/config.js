// Every tuning number and colour in one place. The playfield is a fixed
// 1280x800 logical area; the renderer scales it to the window, so no rule
// below depends on the screen size.
export const FIELD = { width: 1280, height: 800 };

/** The simulation's fixed step, in seconds: 60 updates a second. */
export const STEP = 1 / 60;

/** A shift lasts three minutes of play. */
export const SHIFT_SECONDS = 180;

/** How many orders may wait on the board at once. */
export const MAX_ORDERS = 4;

/** Seconds between new walk-up customers (shrinks as the rush builds). */
export const ORDER_EVERY = 16;
export const ORDER_EVERY_LATE = 11;

/** A fresh order's patience, in seconds, before the customer walks away. */
export const PATIENCE = 50;

/** Grill timing, in seconds of cooking: flip at half, perfect until burnt. */
export const GRILL = {
  slots: 4,
  flipAt: 5,
  perfectAt: 9,
  burntAt: 14,
};

/** The menu: every dish the board can ask for, with its recipe and price. */
export const MENU = [
  { name: 'Sate Ayam + Lontong', ayam: 2, kambing: 0, sauce: 1, lontong: 1, drink: 0, price: 16 },
  { name: 'Sate Kambing + Es Teh', ayam: 0, kambing: 2, sauce: 1, lontong: 0, drink: 1, price: 18 },
  { name: 'Sate Campur Spesial', ayam: 1, kambing: 1, sauce: 1, lontong: 1, drink: 1, price: 22 },
  { name: 'Sate Ayam Jumbo', ayam: 3, kambing: 0, sauce: 1, lontong: 0, drink: 1, price: 20 },
  { name: 'Sate Kambing + Lontong', ayam: 0, kambing: 2, sauce: 1, lontong: 1, drink: 0, price: 19 },
];

/** The walk-up customers: name, skin, shirt and hair for their ticket face. */
export const CUSTOMERS = [
  { name: 'Maya', skin: '#f2c89b', shirt: '#e4572e', hair: '#2b1d16' },
  { name: 'Budi', skin: '#d9a066', shirt: '#2e86ab', hair: '#17120e' },
  { name: 'Sari', skin: '#eec39a', shirt: '#f2a541', hair: '#3a2417' },
  { name: 'Agus', skin: '#c98d54', shirt: '#4caf50', hair: '#100c09' },
  { name: 'Rina', skin: '#f6d3a8', shirt: '#9b5de5', hair: '#241812' },
  { name: 'Dewi', skin: '#e5b57e', shirt: '#ef476f', hair: '#1d130c' },
];

/** Warm night-market dusk palette: bright, full, never dark and empty. */
export const PALETTE = {
  skyTop: '#ffb347',
  skyMid: '#ff7e5f',
  skyLow: '#7b2d8b',
  awningA: '#e4572e',
  awningB: '#fff3d6',
  board: '#4a2c14',
  boardEdge: '#2e1a0a',
  ticket: '#fff8e7',
  ticketEdge: '#e8c98a',
  wood: '#8b5a2b',
  woodDark: '#6b4423',
  counter: '#a9713a',
  grill: '#26221f',
  grillEdge: '#171310',
  coal: '#ff6b35',
  coalHot: '#ffd23f',
  plate: '#ffffff',
  plateEdge: '#d9c9a8',
  sauce: '#8a5a2b',
  sauceLight: '#b5773a',
  lontong: '#f5f1e6',
  tea: '#e8912d',
  teaDark: '#b96a12',
  text: '#2b1d16',
  textLight: '#fff8e7',
  muted: '#7a5c44',
  green: '#43aa4b',
  greenDark: '#2c7a32',
  red: '#d62828',
  gold: '#f2c94c',
  smoke: 'rgba(220, 215, 205, 0.55)',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best shift total is kept between visits (this browser only). */
export const BEST_KEY = 'sate-senja.best-coins';
