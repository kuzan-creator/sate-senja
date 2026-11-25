// Every pixel of Sate Senja: the dusk sky, the striped awning, the order
// board, the charcoal grill, the plating counter and the waiting customer.
// All art is drawn in code (canvas shapes); no images, no network.
import { FIELD, GRILL, MENU, PALETTE } from './config.js';
import { ZONES } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

/** Clickable menu rectangles, shared with main.js (same numbers, one
 * source of truth): title options, pause options, game-over buttons, and
 * the How to Play BACK button. */
export const MENU_ZONES = {
  titleStart: { x: 460, y: 464, w: 360, h: 52 },
  titleHowto: { x: 460, y: 528, w: 360, h: 52 },
  pauseResume: { x: 400, y: 276, w: 480, h: 52 },
  pauseRestart: { x: 400, y: 346, w: 480, h: 52 },
  pauseHowto: { x: 400, y: 416, w: 480, h: 52 },
  overAgain: { x: 430, y: 528, w: 200, h: 56 },
  overMenu: { x: 650, y: 528, w: 200, h: 56 },
  howtoBack: { x: 520, y: 664, w: 240, h: 52 },
};

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight = '700', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}

function meatColor(stage, t) {
  if (stage === 'burnt') return '#241a12';
  if (stage === 'perfect') return '#8a5a2b';
  if (stage === 'flip') return '#a8642f';
  const k = Math.min(1, t / GRILL.flipAt);
  const r = Math.round(232 - 70 * k);
  const g = Math.round(144 - 40 * k);
  const b = Math.round(124 - 60 * k);
  return `rgb(${r},${g},${b})`;
}

/** One skewer: a bamboo stick with three meat cubes, drawn at (x, y). */
function drawSkewer(ctx, x, y, w, stage, t, flip) {
  const cy = y + 34;
  ctx.strokeStyle = '#d9b380';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 4, cy);
  ctx.lineTo(x + w - 4, cy);
  ctx.stroke();
  const mc = meatColor(stage, t);
  for (let i = 0; i < 3; i += 1) {
    const mx = x + 18 + i * 26;
    ctx.fillStyle = mc;
    rr(ctx, mx, cy - 11, 20, 22, 4);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    rr(ctx, mx, cy - 11, 20, 7, 4);
    ctx.fill();
  }
  if (flip) {
    ctx.save();
    ctx.translate(x + w / 2, y + 8);
    ctx.rotate(-0.12);
    ctx.fillStyle = '#ff8c42';
    ctx.font = '700 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FLIP!', 0, 0);
    ctx.restore();
  }
}

/** A customer face, distinct per person: each `style` draws a different
 * silhouette (ponytail / moustache+cap / headscarf / spiky / bun / bob) so
 * tickets and the big portrait never look like clones. */
function drawFace(ctx, x, y, r, who, happy) {
  const style = who.style || 'plain';
  if (style === 'scarf') {
    // Headscarf: a coloured hood framing the face, with a knot at the chin.
    ctx.fillStyle = who.scarf || '#2e86ab';
    ctx.beginPath();
    ctx.arc(x, y, r * 1.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = who.skin;
    ctx.beginPath();
    ctx.arc(x, y + r * 0.08, r * 0.78, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = who.scarf || '#2e86ab';
    ctx.beginPath();
    ctx.arc(x, y + r * 0.95, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = who.skin;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    if (style === 'spiky') {
      // Spiky hair: a row of triangles on top of the head.
      ctx.fillStyle = who.hair;
      ctx.beginPath();
      for (let i = 0; i < 5; i += 1) {
        const hx = x - r * 0.8 + i * r * 0.4;
        ctx.moveTo(hx, y - r * 0.35);
        ctx.lineTo(hx + r * 0.2, y - r * 1.05);
        ctx.lineTo(hx + r * 0.4, y - r * 0.35);
      }
      ctx.fill();
    } else {
      // Hair cap over the top of the head.
      ctx.fillStyle = who.hair;
      ctx.beginPath();
      ctx.arc(x, y - r * 0.35, r * 0.95, Math.PI, 0);
      ctx.fill();
    }
    if (style === 'ponytail') {
      // Side ponytail with a tie, on the viewer's right.
      ctx.fillStyle = who.hair;
      ctx.beginPath();
      ctx.arc(x + r * 0.95, y - r * 0.05, r * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e4572e';
      ctx.beginPath();
      ctx.arc(x + r * 0.78, y - r * 0.28, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === 'bun') {
      // Topknot, big enough to read at ticket size.
      ctx.fillStyle = who.hair;
      ctx.beginPath();
      ctx.arc(x, y - r * 1.12, r * 0.46, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === 'bob') {
      // Bob cut: hair falling to the chin on both sides.
      ctx.fillStyle = who.hair;
      rr(ctx, x - r * 0.98, y - r * 0.4, r * 0.3, r * 0.95, r * 0.12);
      ctx.fill();
      rr(ctx, x + r * 0.68, y - r * 0.4, r * 0.3, r * 0.95, r * 0.12);
      ctx.fill();
    } else if (style === 'moustache') {
      // Flat cap on top, moustache under the nose.
      ctx.fillStyle = '#2e4057';
      ctx.beginPath();
      ctx.arc(x, y - r * 0.55, r * 0.9, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(x - r * 0.9, y - r * 0.62, r * 1.8, r * 0.16);
      ctx.fillStyle = who.hair;
      ctx.beginPath();
      ctx.ellipse(x - r * 0.2, y + r * 0.28, r * 0.24, r * 0.1, -0.25, 0, Math.PI * 2);
      ctx.ellipse(x + r * 0.2, y + r * 0.28, r * 0.24, r * 0.1, 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = '#241a12';
  ctx.beginPath();
  ctx.arc(x - r * 0.32, y - r * 0.02, r * 0.09, 0, Math.PI * 2);
  ctx.arc(x + r * 0.32, y - r * 0.02, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#241a12';
  ctx.lineWidth = Math.max(2, r * 0.08);
  ctx.beginPath();
  if (happy) ctx.arc(x, y + r * 0.18, r * 0.45, 0.15 * Math.PI, 0.85 * Math.PI);
  else ctx.arc(x, y + r * 0.58, r * 0.3, 1.15 * Math.PI, 1.85 * Math.PI);
  ctx.stroke();
}

/** Mini recipe icons for tickets and the plate. */
function drawMiniSkewer(ctx, x, y) {
  ctx.strokeStyle = '#8a6a45';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + 4);
  ctx.lineTo(x + 22, y + 4);
  ctx.stroke();
  ctx.fillStyle = '#8a5a2b';
  for (let i = 0; i < 3; i += 1) ctx.fillRect(x + 3 + i * 6, y, 5, 8);
}
function drawMiniLontong(ctx, x, y) {
  ctx.fillStyle = '#f5f1e6';
  rr(ctx, x, y, 14, 14, 3);
  ctx.fill();
  ctx.strokeStyle = '#7a9a4d';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, 14, 14);
}
function drawMiniDrink(ctx, x, y) {
  ctx.fillStyle = '#e8912d';
  rr(ctx, x + 2, y + 4, 10, 12, 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 9, y + 4);
  ctx.lineTo(x + 12, y - 3);
  ctx.stroke();
}
function drawMiniSauce(ctx, x, y) {
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.arc(x + 7, y + 8, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 7, y - 4);
  ctx.lineTo(x + 2, y + 6);
  ctx.lineTo(x + 12, y + 6);
  ctx.closePath();
  ctx.fill();
}
function drawMiniKerupuk(ctx, x, y) {
  // Mini cracker: a small pale-gold circle with a wavy edge and dots.
  ctx.fillStyle = '#f2d492';
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    const r = i % 2 === 0 ? 7 : 5.5;
    const px = x + 7 + Math.cos(a) * r;
    const py = y + 8 + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#c98f2e';
  ctx.fillRect(x + 5, y + 6, 2, 2);
  ctx.fillRect(x + 9, y + 9, 2, 2);
}

function drawTicket(ctx, order, x, y, w, h, urgent) {
  ctx.fillStyle = PALETTE.ticket;
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = urgent ? PALETTE.red : PALETTE.ticketEdge;
  ctx.lineWidth = urgent ? 3 : 2;
  rr(ctx, x, y, w, h, 10);
  ctx.stroke();
  drawFace(ctx, x + 30, y + 30, 20, order.customer, !urgent);
  text(ctx, order.customer.name, x + 58, y + 24, 15, PALETTE.text, '800');
  text(ctx, order.name, x + 58, y + 44, 12.5, PALETTE.muted, '600');
  text(ctx, `$${order.price}`, x + w - 12, y + 24, 17, PALETTE.greenDark, '800', 'right');
  // Recipe icons row.
  let ix = x + 58;
  for (let i = 0; i < order.ayam + order.kambing; i += 1) {
    drawMiniSkewer(ctx, ix, y + 56);
    ix += 26;
  }
  if (order.sauce) { drawMiniSauce(ctx, ix, y + 56); ix += 22; }
  if (order.lontong) { drawMiniLontong(ctx, ix, y + 56); ix += 22; }
  if (order.drink) { drawMiniDrink(ctx, ix, y + 56); ix += 22; }
  if (order.kerupuk) { drawMiniKerupuk(ctx, ix, y + 56); ix += 22; }
  // Patience bar.
  const bw = w - 24;
  ctx.fillStyle = '#e3d3b3';
  rr(ctx, x + 12, y + h - 16, bw, 8, 4);
  ctx.fill();
  ctx.fillStyle = order.patience > 0.5 ? PALETTE.green : order.patience > 0.25 ? '#f2a541' : PALETTE.red;
  if (order.patience > 0) {
    rr(ctx, x + 12, y + h - 16, bw * order.patience, 8, 4);
    ctx.fill();
  }
  if (urgent) text(ctx, 'HURRY!', x + w - 12, y + h - 22, 11, PALETTE.red, '800', 'right');
}

function drawGrillSlot(ctx, slot, stage, x, y, w, h, time) {
  ctx.fillStyle = '#1b1712';
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = '#3d332a';
  ctx.lineWidth = 2;
  rr(ctx, x, y, w, h, 10);
  ctx.stroke();
  // Charcoal glow.
  const glow = stage === 'burnt' ? 0.15 : 0.5 + 0.2 * Math.sin(time * 3 + x);
  const g = ctx.createRadialGradient(x + w / 2, y + h - 18, 4, x + w / 2, y + h - 18, 46);
  g.addColorStop(0, `rgba(255, 107, 53, ${glow})`);
  g.addColorStop(1, 'rgba(255, 107, 53, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y + h - 52, w, 52);
  if (slot.kind) {
    drawSkewer(ctx, x + 6, y + 18, w - 12, stage, slot.t, stage === 'flip');
    if (stage === 'perfect') {
      ctx.strokeStyle = PALETTE.green;
      ctx.lineWidth = 4;
      rr(ctx, x + 3, y + 3, w - 6, h - 6, 9);
      ctx.stroke();
      if (slot.t >= GRILL.burntAt - 2) text(ctx, 'BURNING!', x + w / 2, y + h - 8, 13, '#ff5722', '800', 'center');
      else text(ctx, 'READY!', x + w / 2, y + h - 8, 13, PALETTE.green, '800', 'center');
    } else if (stage === 'burnt') {
      text(ctx, 'BURNT!', x + w / 2, y + h - 8, 13, PALETTE.red, '800', 'center');
      // Smoke puffs, clamped to stay inside this slot AND clear of the
      // BURNT! label at the bottom: they rise from the coals to mid-slot
      // and wrap, never over the GRILL header or any text.
      ctx.fillStyle = PALETTE.smoke;
      for (let i = 0; i < 3; i += 1) {
        const sy = y + 16 + ((time * 22 + i * 16) % (h - 56));
        ctx.beginPath();
        ctx.arc(x + w / 2 + (i - 1) * 14, sy, 6 + i, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (stage === 'flip') {
      text(ctx, 'FLIP ME!', x + w / 2, y + h - 8, 13, '#ff8c42', '800', 'center');
    } else {
      // Cook progress bar.
      const p = Math.min(1, slot.t / GRILL.perfectAt);
      ctx.fillStyle = '#3d332a';
      rr(ctx, x + 10, y + h - 16, w - 20, 6, 3);
      ctx.fill();
      ctx.fillStyle = '#f2a541';
      rr(ctx, x + 10, y + h - 16, (w - 20) * p, 6, 3);
      ctx.fill();
    }
  } else {
    text(ctx, '+', x + w / 2, y + h / 2 + 12, 34, '#5a4632', '700', 'center');
    text(ctx, 'empty slot', x + w / 2, y + h - 10, 11, '#5a4632', '600', 'center');
  }
}

function drawTrayPile(ctx, x, y, w, h, kind, label, selected) {
  ctx.fillStyle = selected ? '#ffe9b0' : '#f7e8c8';
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = selected ? '#e4572e' : '#d9b380';
  ctx.lineWidth = selected ? 3 : 2;
  rr(ctx, x, y, w, h, 10);
  ctx.stroke();
  for (let i = 0; i < 2; i += 1) drawSkewer(ctx, x + 12, y + 2 + i * 24, w - 24, 'cooking', 0, false);
  text(ctx, label, x + 12, y + h - 10, 13, PALETTE.text, '800');
  if (selected) text(ctx, 'SELECTED', x + w - 10, y + 18, 11, '#e4572e', '800', 'right');
}

function drawSaucePot(ctx, x, y, w, h, onPlate) {
  ctx.fillStyle = '#3a2a1a';
  rr(ctx, x + 8, y + 40, w - 16, h - 48, 12);
  ctx.fill();
  ctx.fillStyle = PALETTE.sauce;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + 48, (w - 24) / 2, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.sauceLight;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + 46, (w - 40) / 2, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9a06a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x + w - 22, y + 30);
  ctx.lineTo(x + w - 6, y + 8);
  ctx.stroke();
  text(ctx, 'PEANUT SAUCE', x + w / 2, y + h - 22, 12, '#fff3d6', '800', 'center');
  text(ctx, onPlate ? 'on the plate ✓' : 'click or press S', x + w / 2, y + h - 8, 11, '#f2d8a0', '600', 'center');
}

function drawLontongStack(ctx, x, y, w, h, onPlate) {
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = '#eef3df';
    rr(ctx, x + 14 + i * 6, y + 66 - i * 18, 68, 30, 6);
    ctx.fill();
    ctx.strokeStyle = '#7a9a4d';
    ctx.lineWidth = 2;
    rr(ctx, x + 14 + i * 6, y + 66 - i * 18, 68, 30, 6);
    ctx.stroke();
  }
  text(ctx, 'LONTONG', x + w / 2, y + h - 22, 12, '#fff3d6', '800', 'center');
  text(ctx, onPlate ? 'on the plate ✓' : 'click or press L', x + w / 2, y + h - 8, 11, '#f2d8a0', '600', 'center');
}

/** A woven basket of kerupuk crackers, poking out the top. */
function drawKerupukBasket(ctx, x, y, w, h, onPlate) {
  // Two crackers poking out of the basket.
  for (const [cx, cy, r] of [[x + 32, y + 44, 15], [x + 62, y + 40, 13]]) {
    ctx.fillStyle = '#f7dc9a';
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const a = (i / 10) * Math.PI * 2;
      const rr2 = i % 2 === 0 ? r : r * 0.82;
      const px = cx + Math.cos(a) * rr2;
      const py = cy + Math.sin(a) * rr2;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#c98f2e';
    ctx.fillRect(cx - 5, cy - 2, 3, 3);
    ctx.fillRect(cx + 2, cy + 3, 3, 3);
    ctx.fillRect(cx + 4, cy - 6, 2, 2);
  }
  // The basket.
  ctx.fillStyle = '#8a5a2b';
  rr(ctx, x + 6, y + 52, w - 12, h - 60, 8);
  ctx.fill();
  ctx.strokeStyle = '#c9a06a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 66 + i * 14);
    ctx.lineTo(x + w - 10, y + 66 + i * 14);
    ctx.stroke();
  }
  ctx.strokeStyle = '#5e3413';
  rr(ctx, x + 6, y + 52, w - 12, h - 60, 8);
  ctx.stroke();
  text(ctx, 'KERUPUK', x + w / 2, y + h - 22, 12, '#fff3d6', '800', 'center');
  text(ctx, onPlate ? 'on the plate ✓' : 'click or press K', x + w / 2, y + h - 8, 11, '#f2d8a0', '600', 'center');
}

function drawDrinkStation(ctx, x, y, w, h, onPlate) {
  for (let i = 0; i < 4; i += 1) {
    const gx = x + 24 + i * 88;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    rr(ctx, gx, y + 56, 52, 56, 8);
    ctx.fill();
    ctx.fillStyle = PALETTE.tea;
    rr(ctx, gx + 4, y + 68, 44, 40, 6);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(gx + 10, y + 74, 8, 8);
    ctx.fillRect(gx + 30, y + 84, 8, 8);
    ctx.strokeStyle = '#d62828';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(gx + 34, y + 60);
    ctx.lineTo(gx + 42, y + 50);
    ctx.stroke();
  }
  text(ctx, 'ES TEH  —  sweet iced tea', x + 16, y + h - 22, 13, '#fff3d6', '800');
  text(ctx, onPlate ? 'on the plate ✓' : 'click a glass or press D', x + 16, y + h - 6, 11, '#f2d8a0', '600');
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function drawHeader(s) {
    ctx.fillStyle = '#3a2113';
    ctx.fillRect(0, 0, FIELD.width, 58);
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(34, 29, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a2113';
    ctx.font = '800 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('S', 34, 34);
    text(ctx, 'SATE SENJA', 56, 36, 26, '#fff3d6', '800');
    text(ctx, 'Satay Grill Rush', 236, 36, 14, '#f2a541', '600');
    // Shift timer, centre.
    const mm = Math.floor(s.timeLeft / 60);
    const ss = Math.floor(s.timeLeft % 60);
    const low = s.timeLeft <= 30;
    ctx.fillStyle = low ? PALETTE.red : '#fff3d6';
    rr(ctx, 520, 10, 240, 38, 19);
    ctx.fill();
    text(ctx, 'SHIFT', 600, 36, 13, low ? '#fff' : '#7a5c44', '800', 'center');
    text(ctx, `${mm}:${String(ss).padStart(2, '0')}`, 668, 37, 24, low ? '#fff' : PALETTE.text, '800', 'center');
    // Coins and combo, right.
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(830, 29, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a5c10';
    ctx.font = '800 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$', 830, 35);
    text(ctx, `$${s.coins}`, 852, 37, 24, '#fff3d6', '800');
    const comboColor = s.combo >= 3 ? '#ff8c42' : s.combo >= 2 ? '#f2a541' : '#c9b18a';
    text(ctx, `COMBO x${s.combo}`, 1000, 37, 20, comboColor, '800');
    text(ctx, `served ${s.served}`, 1150, 36, 14, '#c9b18a', '600');
  }

  function drawBoard(s) {
    ctx.fillStyle = PALETTE.board;
    rr(ctx, 8, 64, FIELD.width - 16, 124, 12);
    ctx.fill();
    ctx.strokeStyle = PALETTE.boardEdge;
    ctx.lineWidth = 3;
    rr(ctx, 8, 64, FIELD.width - 16, 124, 12);
    ctx.stroke();
    // Tab label.
    ctx.fillStyle = PALETTE.gold;
    rr(ctx, 24, 56, 170, 20, 8);
    ctx.fill();
    text(ctx, '★ ORDER BOARD', 109, 71, 13, '#3a2113', '800', 'center');
    const z = ZONES.tickets;
    for (let i = 0; i < s.orders.length; i += 1) {
      const o = s.orders[i];
      drawTicket(ctx, o, z.x + i * (z.w + z.gap), z.y, z.w, z.h, o.patience <= 0.25);
    }
    for (let i = s.orders.length; i < 4; i += 1) {
      ctx.fillStyle = 'rgba(255,248,231,0.12)';
      rr(ctx, z.x + i * (z.w + z.gap), z.y, z.w, z.h, 10);
      ctx.fill();
      text(ctx, 'waiting for a customer…', z.x + i * (z.w + z.gap) + z.w / 2, z.y + 54, 13, '#e8c98a', '600', 'center');
    }
  }

  function drawKitchen(s, time) {
    // Warm dusk backdrop + awning.
    const sky = ctx.createLinearGradient(0, 196, 0, 800);
    sky.addColorStop(0, PALETTE.skyTop);
    sky.addColorStop(0.55, PALETTE.skyMid);
    sky.addColorStop(1, '#5b2a6e');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 196, FIELD.width, 604);
    // String lights.
    for (let i = 0; i < 16; i += 1) {
      const lx = 40 + i * 78;
      const ly = 214 + Math.sin(i * 1.3) * 6;
      ctx.fillStyle = i % 3 === 0 ? '#ffd23f' : i % 3 === 1 ? '#ff8c42' : '#fff3d6';
      ctx.beginPath();
      ctx.arc(lx, ly, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Awning stripes.
    for (let i = 0; i < 10; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? PALETTE.awningA : PALETTE.awningB;
      ctx.fillRect(16 + i * 125, 232, 125, 26);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(16, 252, 1248, 6);

    // --- Grill station (left) ---
    ctx.fillStyle = PALETTE.wood;
    rr(ctx, 16, 268, 480, 372, 14);
    ctx.fill();
    ctx.fillStyle = PALETTE.woodDark;
    rr(ctx, 16, 268, 480, 34, 14);
    ctx.fill();
    text(ctx, 'GRILL  —  charcoal fire', 32, 291, 15, '#fff3d6', '800');
    text(ctx, 'click a tray pile, then an empty slot', 470, 291, 12, '#f2d8a0', '600', 'right');
    ctx.fillStyle = PALETTE.grill;
    rr(ctx, 40, 306, 432, 138, 12);
    ctx.fill();
    const zg = ZONES.grill;
    for (let i = 0; i < 4; i += 1) {
      const slot = s.grill[i];
      const stage = slot.kind ? stageOf(slot) : 'empty';
      drawGrillSlot(ctx, slot, stage, zg.x + i * (zg.w + zg.gap), zg.y, zg.w, zg.h, time);
    }
    text(ctx, 'flip at FLIP!  •  click at green READY!  •  burnt = bin it', 256, 470, 13, '#ffe9b0', '600', 'center');
    drawTrayPile(ctx, ZONES.trayAyam.x, ZONES.trayAyam.y, ZONES.trayAyam.w, ZONES.trayAyam.h, 'ayam', 'SATE AYAM — chicken', s.selectedKind === 'ayam');
    drawTrayPile(ctx, ZONES.trayKambing.x, ZONES.trayKambing.y, ZONES.trayKambing.w, ZONES.trayKambing.h, 'kambing', 'SATE KAMBING — goat', s.selectedKind === 'kambing');
    text(ctx, 'INGREDIENTS ON THE COUNTER', 256, 640, 12, '#ffe9b0', '800', 'center');

    // --- Plating counter (middle) ---
    ctx.fillStyle = PALETTE.counter;
    rr(ctx, 512, 268, 308, 432, 14);
    ctx.fill();
    ctx.fillStyle = '#8a5a2b';
    rr(ctx, 512, 268, 308, 34, 14);
    ctx.fill();
    text(ctx, 'PLATING COUNTER', 528, 291, 15, '#fff3d6', '800');
    // The plate, shifted left so the drink glass fits BESIDE it.
    ctx.fillStyle = PALETTE.plate;
    ctx.beginPath();
    ctx.ellipse(640, 392, 118, 62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.plateEdge;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(640, 392, 118, 62, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(640, 392, 96, 46, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Food on the plate: every added item is drawn, never just a ✓.
    // Sauce puddle first, under the skewers: darker than the meat so the
    // cubes read against it instead of camouflaging into it.
    if (s.plate.sauce) {
      ctx.fillStyle = '#5e3413';
      ctx.beginPath();
      ctx.ellipse(640, 404, 82, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.sauceLight;
      ctx.beginPath();
      ctx.ellipse(640, 401, 62, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Skewers, staggered sideways so each one reads even when two are
    // plated (a second skewer stacked dead-centre hides behind the first).
    let py = 372;
    for (let i = 0; i < s.plate.ayam + s.plate.kambing; i += 1) {
      drawSkewer(ctx, 552 + i * 16, py - 14, 150, 'perfect', 9, false);
      py += 20;
    }
    if (s.plate.sauce) {
      // Bold peanut-sauce drizzle zig-zagging OVER the skewers.
      ctx.strokeStyle = '#7a4a1f';
      ctx.lineWidth = 8;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(566, 388);
      ctx.lineTo(590, 404);
      ctx.lineTo(614, 388);
      ctx.lineTo(638, 404);
      ctx.lineTo(662, 388);
      ctx.lineTo(686, 404);
      ctx.lineTo(704, 392);
      ctx.stroke();
      ctx.strokeStyle = PALETTE.sauceLight;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(566, 385);
      ctx.lineTo(590, 401);
      ctx.lineTo(614, 385);
      ctx.lineTo(638, 401);
      ctx.lineTo(662, 385);
      ctx.lineTo(686, 401);
      ctx.lineTo(704, 389);
      ctx.stroke();
    }
    if (s.plate.lontong) {
      // Three white-green lontong cubes sitting ON the plate.
      const cubes = [[688, 350], [708, 354], [696, 368]];
      for (const [cx, cy] of cubes) {
        ctx.fillStyle = '#f5f1e6';
        rr(ctx, cx, cy, 18, 18, 3);
        ctx.fill();
        ctx.strokeStyle = '#7a9a4d';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx, cy, 18, 18);
        ctx.fillStyle = '#cfe0ae';
        ctx.fillRect(cx + 3, cy + 3, 12, 4);
      }
    }
    if (s.plate.drink) {
      // Iced-tea glass with a straw, standing BESIDE the plate.
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      rr(ctx, 772, 344, 30, 46, 5);
      ctx.fill();
      ctx.fillStyle = PALETTE.tea;
      rr(ctx, 775, 356, 24, 31, 4);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(780, 361, 6, 6);
      ctx.fillRect(790, 371, 6, 6);
      ctx.strokeStyle = '#d62828';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(790, 348);
      ctx.lineTo(798, 334);
      ctx.stroke();
    }
    if (s.plate.kerupuk) {
      // A round kerupuk cracker with a wavy edge, sitting ON the plate
      // (bottom-right, clear of the skewers and the lontong cubes).
      const cx = 702;
      const cy = 428;
      ctx.fillStyle = '#f7dc9a';
      ctx.beginPath();
      for (let i = 0; i < 10; i += 1) {
        const a = (i / 10) * Math.PI * 2;
        const r = i % 2 === 0 ? 14 : 11.5;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#d9a441';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#c98f2e';
      ctx.fillRect(cx - 5, cy - 2, 3, 3);
      ctx.fillRect(cx + 2, cy + 3, 3, 3);
      ctx.fillRect(cx + 4, cy - 6, 2, 2);
    }
    if (!s.plate.ayam && !s.plate.kambing && !s.plate.sauce && !s.plate.lontong && !s.plate.drink && !s.plate.kerupuk) {
      text(ctx, 'empty plate — build a dish here', 640, 396, 13, '#b09a7a', '600', 'center');
    }
    drawSaucePot(ctx, ZONES.sauce.x, ZONES.sauce.y, ZONES.sauce.w, ZONES.sauce.h, s.plate.sauce > 0);
    drawLontongStack(ctx, ZONES.lontong.x, ZONES.lontong.y, ZONES.lontong.w, ZONES.lontong.h, s.plate.lontong > 0);
    drawKerupukBasket(ctx, ZONES.kerupuk.x, ZONES.kerupuk.y, ZONES.kerupuk.w, ZONES.kerupuk.h, s.plate.kerupuk > 0);
    // Serve button.
    const canServe = s.plate.ayam + s.plate.kambing + s.plate.sauce + s.plate.lontong + s.plate.drink + s.plate.kerupuk > 0;
    ctx.fillStyle = canServe ? PALETTE.green : '#8a7a66';
    rr(ctx, ZONES.serve.x, ZONES.serve.y, ZONES.serve.w, ZONES.serve.h, 12);
    ctx.fill();
    ctx.strokeStyle = canServe ? PALETTE.greenDark : '#6b5c4a';
    ctx.lineWidth = 3;
    rr(ctx, ZONES.serve.x, ZONES.serve.y, ZONES.serve.w, ZONES.serve.h, 12);
    ctx.stroke();
    text(ctx, 'SERVE!', ZONES.serve.x + ZONES.serve.w / 2, ZONES.serve.y + 36, 20, '#fff', '800', 'center');

    // --- Drink station + customer (right) ---
    ctx.fillStyle = '#7b4a21';
    rr(ctx, 836, 268, 428, 432, 14);
    ctx.fill();
    ctx.fillStyle = '#5e3617';
    rr(ctx, 836, 268, 428, 34, 14);
    ctx.fill();
    text(ctx, 'DRINK STATION', 852, 291, 15, '#fff3d6', '800');
    drawDrinkStation(ctx, ZONES.drink.x, ZONES.drink.y, ZONES.drink.w, ZONES.drink.h, s.plate.drink > 0);
    // Waiting customer.
    const first = s.orders[0];
    const happy = s.lastServedHappy || (first ? first.patience > 0.25 : true);
    const who = first ? first.customer : { name: '—', skin: '#f2c89b', shirt: '#e4572e', hair: '#2b1d16' };
    ctx.fillStyle = who.shirt;
    rr(ctx, 968, 520, 160, 130, 18);
    ctx.fill();
    drawFace(ctx, 1048, 470, 52, who, !!happy);
    const bubble = s.bubble || (s.lastServedHappy ? 'So yummy! Thank you!' : first ? `${who.name}: “I'm hungry — hurry!”` : 'Next customer coming…');
    ctx.fillStyle = '#fff8e7';
    rr(ctx, 868, 640 - 84, 364, 56, 12);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(1030, 640 - 28);
    ctx.lineTo(1050, 640 - 8);
    ctx.lineTo(1070, 640 - 28);
    ctx.closePath();
    ctx.fill();
    text(ctx, bubble, 1050, 640 - 50, 14, PALETTE.text, '700', 'center');
    text(ctx, first ? `waiting: ${first.name}` : 'stall is quiet', 1050, 676, 12, '#ffe9b0', '600', 'center');

    // Floating coin pops.
    for (const f of s.fx) {
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
      ctx.font = '800 22px system-ui, -apple-system, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(43,29,22,0.9)';
      ctx.strokeText(f.text, f.x, f.y - (1.6 - f.life) * 40);
      ctx.fillStyle = f.color === '#2c7a32' ? '#7ee787' : f.color;
      ctx.fillText(f.text, f.x, f.y - (1.6 - f.life) * 40);
      ctx.globalAlpha = 1;
    }
    // Status ticker: a full-width bar filling the band between the panels
    // and the bottom bar, so no empty purple strip is ever visible. It is
    // always drawn (a default line when no toast is active).
    const line = s.toastT > 0 && s.toast ? s.toast : 'Grill, sauce, plate, serve — keep the rush going!';
    ctx.fillStyle = '#2e1a0e';
    ctx.fillRect(0, 700, FIELD.width, 44);
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(0, 700, FIELD.width, 3);
    text(ctx, '★ SATE SENJA • NIGHT MARKET', 24, 729, 13, PALETTE.gold, '800');
    text(ctx, line, FIELD.width / 2, 729, 15, '#fff3d6', '600', 'center');
    text(ctx, `served ${s.served}  •  COMBO x${s.combo}`, FIELD.width - 24, 729, 13, '#f2a541', '800', 'right');
  }

  function drawBottomBar(s) {
    ctx.fillStyle = '#3a2113';
    ctx.fillRect(0, 744, FIELD.width, 56);
    text(ctx, 'CLICK: tray → grill slot • flip at FLIP! • plate at READY! • sauce / lontong / drink / kerupuk onto the plate • SERVE or Space', 24, 770, 14, '#f2d8a0', '600');
    text(ctx, 'KEYS: 1–4 grill  •  A/G skewer  •  S sauce  •  L lontong  •  D drink  •  K kerupuk  •  Space serve  •  P pause', 24, 790, 13, '#c9a06a', '600');
    const prog = 1 - s.timeLeft / 180;
    ctx.fillStyle = '#5e3a1c';
    rr(ctx, 980, 758, 276, 10, 5);
    ctx.fill();
    ctx.fillStyle = '#f2a541';
    rr(ctx, 980, 758, 276 * prog, 10, 5);
    ctx.fill();
    text(ctx, 'SHIFT', 968, 768, 12, '#f2a541', '800', 'right');
  }

  /** One menu option row: a filled button, highlighted when selected. */
  function drawOption(ctx, z, label, selected, sub) {
    ctx.fillStyle = selected ? PALETTE.green : 'rgba(43,29,22,0.82)';
    rr(ctx, z.x, z.y, z.w, z.h, 12);
    ctx.fill();
    ctx.strokeStyle = selected ? PALETTE.gold : 'rgba(255,243,214,0.5)';
    ctx.lineWidth = selected ? 3 : 2;
    rr(ctx, z.x, z.y, z.w, z.h, 12);
    ctx.stroke();
    text(ctx, (selected ? '▶  ' : '     ') + label, z.x + z.w / 2, z.y + 34, 20, '#fff', '800', 'center');
    if (sub) text(ctx, sub, z.x + z.w - 14, z.y + 34, 12, selected ? '#fff' : '#c9a06a', '600', 'right');
  }

  function drawTitle(best, ui) {
    const sky = ctx.createLinearGradient(0, 0, 0, 800);
    sky.addColorStop(0, PALETTE.skyTop);
    sky.addColorStop(0.5, PALETTE.skyMid);
    sky.addColorStop(1, '#5b2a6e');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    for (let i = 0; i < 10; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? PALETTE.awningA : PALETTE.awningB;
      ctx.fillRect(i * 128, 0, 128, 40);
    }
    text(ctx, 'SATE SENJA', 640, 240, 96, '#fff3d6', '800', 'center');
    text(ctx, '—  SATAY GRILL RUSH  —', 640, 292, 30, PALETTE.gold, '700', 'center');
    text(ctx, 'Run the night-market satay stall: grill skewers over charcoal,', 640, 360, 20, '#fff3d6', '600', 'center');
    text(ctx, 'drown them in peanut sauce, plate with lontong, kerupuk and es teh,', 640, 388, 20, '#fff3d6', '600', 'center');
    text(ctx, 'and serve before patience runs out.', 640, 416, 20, '#fff3d6', '600', 'center');
    const sel = ui && typeof ui.title === 'number' ? ui.title : 0;
    drawOption(ctx, MENU_ZONES.titleStart, 'START SHIFT', sel === 0, 'Space / 1');
    drawOption(ctx, MENU_ZONES.titleHowto, 'HOW TO PLAY', sel === 1, '2');
    text(ctx, '↑↓ choose  •  Enter select  •  click an option', 640, 614, 15, '#ffe9b0', '600', 'center');
    if (best > 0) text(ctx, `Best shift so far: $${best}`, 640, 652, 16, PALETTE.gold, '700', 'center');
  }

  /** How to Play: the full menu with prices, all controls, and the loop.
   * Drawn as a centred panel over whatever screen opened it, so the stall
   * stays visible at the edges. */
  function drawHowTo() {
    ctx.fillStyle = 'rgba(43,29,22,0.72)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = '#4a2c14';
    rr(ctx, 100, 60, 1080, 660, 16);
    ctx.fill();
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 3;
    rr(ctx, 100, 60, 1080, 660, 16);
    ctx.stroke();
    text(ctx, '★  HOW TO PLAY  ★', 640, 116, 30, PALETTE.gold, '800', 'center');
    text(ctx, 'THE MENU — every dish, every price', 150, 152, 15, '#ffe9b0', '800');
    const left = MENU.slice(0, 6);
    const right = MENU.slice(6);
    for (let i = 0; i < left.length; i += 1) {
      text(ctx, `•  ${left[i].name}`, 150, 182 + i * 30, 15, '#fff3d6', '600');
      text(ctx, `$${left[i].price}`, 560, 182 + i * 30, 15, PALETTE.gold, '800', 'right');
    }
    for (let i = 0; i < right.length; i += 1) {
      text(ctx, `•  ${right[i].name}`, 700, 182 + i * 30, 15, '#fff3d6', '600');
      text(ctx, `$${right[i].price}`, 1130, 182 + i * 30, 15, PALETTE.gold, '800', 'right');
    }
    text(ctx, 'CONTROLS', 150, 392, 15, '#ffe9b0', '800');
    text(ctx, 'Click a tray pile, then an empty grill slot  •  click a slot at FLIP! to flip it, at green READY! to plate it', 150, 420, 14, '#fff3d6', '600');
    text(ctx, 'Click the sauce pot / lontong stack / kerupuk basket / a tea glass to add it to the plate  •  SERVE! or Space serves', 150, 444, 14, '#fff3d6', '600');
    text(ctx, 'Keys:  1–4 grill  •  A/G skewer  •  S sauce  •  L lontong  •  D drink  •  K kerupuk  •  Space serve  •  P pause', 150, 468, 14, '#fff3d6', '600');
    text(ctx, 'TIPS', 150, 512, 15, '#ffe9b0', '800');
    text(ctx, 'Serve fast for bigger tips  •  every serve in a row grows the combo  •  a burnt skewer goes in the bin — click it', 150, 540, 14, '#fff3d6', '600');
    text(ctx, 'Match the ticket exactly: skewers, sauce, lontong, drink AND kerupuk — or the plate will not serve.', 150, 564, 14, '#fff3d6', '600');
    text(ctx, 'A red HURRY! ticket is about to walk away — serve it first.', 150, 588, 14, '#fff3d6', '600');
    drawOption(ctx, MENU_ZONES.howtoBack, 'BACK', true, 'Esc / B');
  }

  function drawOver(s, best) {
    ctx.fillStyle = 'rgba(43,29,22,0.82)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    text(ctx, 'SHIFT OVER!', 640, 250, 72, '#fff3d6', '800', 'center');
    text(ctx, `You earned $${s.coins}  •  served ${s.served} customers  •  ${s.lost} walked away`, 640, 320, 22, '#f2d8a0', '600', 'center');
    const stars = s.coins >= 300 ? '★★★' : s.coins >= 180 ? '★★☆' : s.coins >= 90 ? '★☆☆' : '☆☆☆';
    text(ctx, stars, 640, 390, 48, PALETTE.gold, '800', 'center');
    if (s.coins > best) text(ctx, 'New best shift!', 640, 440, 20, PALETTE.gold, '800', 'center');
    drawOption(ctx, MENU_ZONES.overAgain, 'PLAY AGAIN', true, 'R');
    ctx.fillStyle = '#8a5a2b';
    rr(ctx, MENU_ZONES.overMenu.x, MENU_ZONES.overMenu.y, MENU_ZONES.overMenu.w, MENU_ZONES.overMenu.h, 12);
    ctx.fill();
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 2;
    rr(ctx, MENU_ZONES.overMenu.x, MENU_ZONES.overMenu.y, MENU_ZONES.overMenu.w, MENU_ZONES.overMenu.h, 12);
    ctx.stroke();
    text(ctx, 'BACK TO MENU', MENU_ZONES.overMenu.x + MENU_ZONES.overMenu.w / 2, MENU_ZONES.overMenu.y + 35, 16, '#fff', '800', 'center');
    text(ctx, 'R play again  •  M back to menu  •  or click a button', 640, 626, 16, '#fff3d6', '600', 'center');
  }

  /** Pause menu: a panel at most 50% of the screen wide, over a dimmed
   * kitchen that stays visible behind and around it. */
  function drawPaused(ui) {
    ctx.fillStyle = 'rgba(43,29,22,0.5)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = '#4a2c14';
    rr(ctx, 320, 190, 640, 400, 16);
    ctx.fill();
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 3;
    rr(ctx, 320, 190, 640, 400, 16);
    ctx.stroke();
    text(ctx, 'PAUSED', 640, 248, 40, '#fff3d6', '800', 'center');
    const sel = ui && typeof ui.pause === 'number' ? ui.pause : 0;
    drawOption(ctx, MENU_ZONES.pauseResume, 'RESUME', sel === 0, 'P');
    drawOption(ctx, MENU_ZONES.pauseRestart, 'RESTART SHIFT', sel === 1, '2');
    drawOption(ctx, MENU_ZONES.pauseHowto, 'HOW TO PLAY', sel === 2, '3');
    text(ctx, '↑↓ choose  •  Enter select  •  P resume', 640, 516, 15, '#ffe9b0', '600', 'center');
    text(ctx, 'the skewers wait for no one…', 640, 548, 14, '#c9a06a', '600', 'center');
  }

  function draw(state, screen, best, ui) {
    ctx.clearRect(0, 0, FIELD.width, FIELD.height);
    if (screen === SCREEN_TITLE) {
      drawTitle(best, ui);
    } else {
      drawHeader(state);
      drawBoard(state);
      drawKitchen(state, state.time);
      drawBottomBar(state);
      if (screen === SCREEN_OVER) drawOver(state, best);
      else if (screen === SCREEN_PAUSED) drawPaused(ui);
    }
    if (ui && ui.howto) drawHowTo();
  }

  return { draw };
}

/** Grill slot stage, mirrored from the world (render must not import rules). */
function stageOf(slot) {
  if (!slot.kind) return 'empty';
  if (slot.t >= GRILL.burntAt) return 'burnt';
  if (!slot.flipped && slot.t >= GRILL.flipAt) return 'flip';
  if (slot.flipped && slot.t >= GRILL.perfectAt) return 'perfect';
  return 'cooking';
}
