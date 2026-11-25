// The screenshot scenes behind ?shot=1..18. Each one stages a real world
// state directly (orders, grill, plate, coins, timer) and the renderer paints
// it, so the frame is exactly what a played shift looks like at that moment
// and the same seed always gives the same frame. No title screen, no modal.
import { GRILL } from './config.js';
import { createWorld } from './world.js';

function order(random, name, customer, recipe, price, patience) {
  return {
    id: Math.floor(random.next() * 100000),
    name,
    customer,
    ayam: recipe.ayam ?? 0,
    kambing: recipe.kambing ?? 0,
    sauce: recipe.sauce ?? 0,
    lontong: recipe.lontong ?? 0,
    drink: recipe.drink ?? 0,
    kerupuk: recipe.kerupuk ?? 0,
    price,
    patience,
    maxSeconds: 50,
    secondsLeft: 50 * patience,
    served: false,
    leaving: false,
  };
}

function slot(kind, t, flipped) {
  return { kind, t, flipped };
}

/** Stage `world` to the named shot and return the screen to draw over it. */
export function stageShot(name, world, random) {
  const s = world.state;
  world.reset();
  const C = [
    { name: 'Maya', skin: '#f6cf9f', shirt: '#e4572e', hair: '#2b1d16', style: 'ponytail' },
    { name: 'Budi', skin: '#c98d54', shirt: '#2e86ab', hair: '#17120e', style: 'moustache' },
    { name: 'Sari', skin: '#eec39a', shirt: '#f2a541', hair: '#3a2417', style: 'scarf', scarf: '#2e86ab' },
    { name: 'Agus', skin: '#a06a35', shirt: '#4caf50', hair: '#100c09', style: 'spiky' },
    { name: 'Rina', skin: '#f6d3a8', shirt: '#9b5de5', hair: '#241812', style: 'bun' },
    { name: 'Dewi', skin: '#e5b57e', shirt: '#ef476f', hair: '#1d130c', style: 'bob' },
  ];

  if (name === '15') {
    // Shot A (v4): TITLE SCREEN with the filled lower band — six
    // customers, a big skewer, and the dish range under the buttons.
    return { screen: 'title', best: 312, ui: { title: 0, pause: 0, howto: false } };
  } else if (name === '16') {
    // Shot B (v4): PEAK RUSH with kerupuk — plate cracker now big, dark
    // gold, breaking the plate's edge so it reads at thumbnail size.
    s.timeLeft = 118;
    s.coins = 261;
    s.combo = 6;
    s.served = 12;
    s.orders = [
      order(random, 'Sate Ayam + Kerupuk', C[4], { ayam: 2, sauce: 1, kerupuk: 1 }, 18, 0.15),
      order(random, 'Sate Campur Spesial', C[0], { ayam: 1, kambing: 1, sauce: 1, lontong: 1, drink: 1 }, 22, 0.22),
      order(random, 'Sate Kambing + Kerupuk', C[1], { kambing: 2, sauce: 1, kerupuk: 1 }, 20, 0.4),
      order(random, 'Sate Ayam Jumbo + Lontong', C[5], { ayam: 3, sauce: 1, lontong: 1 }, 22, 0.55),
    ];
    s.grill = [
      slot('ayam', 5.5, false),
      slot('kambing', 5.8, false),
      slot('ayam', 11.0, true),
      slot('kambing', 13.6, true),
    ];
    s.plate = { ayam: 1, kambing: 0, sauce: 1, lontong: 0, drink: 0, kerupuk: 1 };
    s.toast = 'Kerupuk crunch! Rina is about to walk away!';
    s.toastT = 99;
    s.lastServedHappy = false;
  } else if (name === '17') {
    // Shot C (v4): SERVING PAYOFF with a kerupuk dish — Sari happy,
    // +$28 (tip $8) on 'Sate Kambing + Kerupuk', plate full and matching.
    s.timeLeft = 88;
    s.coins = 301;
    s.combo = 8;
    s.served = 16;
    s.orders = [
      order(random, 'Sate Kambing + Kerupuk', C[2], { kambing: 2, sauce: 1, kerupuk: 1 }, 20, 0.8),
      order(random, 'Sate Ayam Jumbo + Lontong', C[3], { ayam: 3, sauce: 1, lontong: 1 }, 22, 0.6),
      order(random, 'Sate Ayam + Es Teh', C[4], { ayam: 2, sauce: 1, drink: 1 }, 17, 0.45),
    ];
    s.grill = [
      slot('kambing', 10.4, true),
      slot('ayam', 3.2, false),
      slot(null, 0, false),
      slot('ayam', 5.6, false),
    ];
    s.plate = { ayam: 0, kambing: 2, sauce: 1, lontong: 0, drink: 0, kerupuk: 1 };
    s.fx = [{ x: 640, y: 318, text: '+$28  (tip $8)', life: 1.6, color: '#2c7a32' }];
    s.toast = 'Sari loved it! Combo x8 — best shift yet!';
    s.toastT = 99;
    s.lastServedHappy = true;
  } else if (name === '18') {
    // Shot D (v4): PAUSE MENU open over gameplay — the panel is 50% wide
    // and the kitchen stays visible behind and around it.
    s.timeLeft = 74;
    s.coins = 233;
    s.combo = 4;
    s.served = 9;
    s.orders = [
      order(random, 'Sate Ayam + Kerupuk', C[0], { ayam: 2, sauce: 1, kerupuk: 1 }, 18, 0.7),
      order(random, 'Sate Kambing Jumbo + Lontong', C[1], { kambing: 3, sauce: 1, lontong: 1 }, 23, 0.5),
      order(random, 'Sate Campur Spesial', C[2], { ayam: 1, kambing: 1, sauce: 1, lontong: 1, drink: 1 }, 22, 0.35),
      order(random, 'Sate Ayam + Es Teh', C[5], { ayam: 2, sauce: 1, drink: 1 }, 17, 0.85),
    ];
    s.grill = [
      slot('ayam', 2.5, false),
      slot('kambing', 5.5, false),
      slot('ayam', 10.8, true),
      slot(null, 0, false),
    ];
    s.plate = { ayam: 1, kambing: 0, sauce: 1, lontong: 0, drink: 0, kerupuk: 1 };
    s.toast = 'Paused — the skewers wait for no one!';
    s.toastT = 99;
    s.lastServedHappy = false;
    return { screen: 'paused', best: 0, ui: { title: 0, pause: 1, howto: false } };
  } else if (name === '13') {
    // Verification-only: SHIFT OVER screen with PLAY AGAIN / BACK TO MENU.
    s.timeLeft = 0;
    s.coins = 312;
    s.combo = 5;
    s.served = 15;
    s.lost = 2;
    s.orders = [
      order(random, 'Sate Ayam + Kerupuk', C[0], { ayam: 2, sauce: 1, kerupuk: 1 }, 18, 0.7),
      order(random, 'Sate Kambing + Lontong', C[3], { kambing: 2, sauce: 1, lontong: 1 }, 19, 0.45),
    ];
    return { screen: 'over', best: 301, ui: { title: 0, pause: 0, howto: false } };
  } else if (name === '14') {
    // Verification-only: HOW TO PLAY panel open over the title screen.
    return { screen: 'title', best: 312, ui: { title: 1, pause: 0, howto: true } };
  } else if (name === '9') {
    // Shot A (v3): TITLE SCREEN with the real options list — START SHIFT
    // highlighted, HOW TO PLAY below it, best shift $312 on show.
    return { screen: 'title', best: 312, ui: { title: 0, pause: 0, howto: false } };
  } else if (name === '10') {
    // Shot B (v3): PEAK RUSH with kerupuk — Rina's ticket carries the new
    // cracker icon, the plate holds a cracker + sauce drizzle, two HURRY.
    s.timeLeft = 118;
    s.coins = 261;
    s.combo = 6;
    s.served = 12;
    s.orders = [
      order(random, 'Sate Ayam + Kerupuk', C[4], { ayam: 2, sauce: 1, kerupuk: 1 }, 18, 0.15),
      order(random, 'Sate Campur Spesial', C[0], { ayam: 1, kambing: 1, sauce: 1, lontong: 1, drink: 1 }, 22, 0.22),
      order(random, 'Sate Kambing + Kerupuk', C[1], { kambing: 2, sauce: 1, kerupuk: 1 }, 20, 0.4),
      order(random, 'Sate Ayam Jumbo + Lontong', C[5], { ayam: 3, sauce: 1, lontong: 1 }, 22, 0.55),
    ];
    s.grill = [
      slot('ayam', 5.5, false),
      slot('kambing', 5.8, false),
      slot('ayam', 11.0, true),
      slot('kambing', 13.6, true),
    ];
    s.plate = { ayam: 1, kambing: 0, sauce: 1, lontong: 0, drink: 0, kerupuk: 1 };
    s.toast = 'Kerupuk crunch! Rina is about to walk away!';
    s.toastT = 99;
    s.lastServedHappy = false;
  } else if (name === '11') {
    // Shot C (v3): SERVING PAYOFF with a new kerupuk dish — Sari happy,
    // +$28 (tip $8) on 'Sate Kambing + Kerupuk', plate full and matching.
    s.timeLeft = 88;
    s.coins = 301;
    s.combo = 8;
    s.served = 16;
    s.orders = [
      order(random, 'Sate Kambing + Kerupuk', C[2], { kambing: 2, sauce: 1, kerupuk: 1 }, 20, 0.8),
      order(random, 'Sate Ayam Jumbo + Lontong', C[3], { ayam: 3, sauce: 1, lontong: 1 }, 22, 0.6),
      order(random, 'Sate Ayam + Es Teh', C[4], { ayam: 2, sauce: 1, drink: 1 }, 17, 0.45),
    ];
    s.grill = [
      slot('kambing', 10.4, true),
      slot('ayam', 3.2, false),
      slot(null, 0, false),
      slot('ayam', 5.6, false),
    ];
    s.plate = { ayam: 0, kambing: 2, sauce: 1, lontong: 0, drink: 0, kerupuk: 1 };
    s.fx = [{ x: 640, y: 318, text: '+$28  (tip $8)', life: 1.6, color: '#2c7a32' }];
    s.toast = 'Sari loved it! Combo x8 — best shift yet!';
    s.toastT = 99;
    s.lastServedHappy = true;
  } else if (name === '12') {
    // Shot D (v3): PAUSE MENU open over gameplay — the panel is 50% wide
    // and the kitchen stays visible behind and around it.
    s.timeLeft = 74;
    s.coins = 233;
    s.combo = 4;
    s.served = 9;
    s.orders = [
      order(random, 'Sate Ayam + Kerupuk', C[0], { ayam: 2, sauce: 1, kerupuk: 1 }, 18, 0.7),
      order(random, 'Sate Kambing Jumbo + Lontong', C[1], { kambing: 3, sauce: 1, lontong: 1 }, 23, 0.5),
      order(random, 'Sate Campur Spesial', C[2], { ayam: 1, kambing: 1, sauce: 1, lontong: 1, drink: 1 }, 22, 0.35),
      order(random, 'Sate Ayam + Es Teh', C[5], { ayam: 2, sauce: 1, drink: 1 }, 17, 0.85),
    ];
    s.grill = [
      slot('ayam', 2.5, false),
      slot('kambing', 5.5, false),
      slot('ayam', 10.8, true),
      slot(null, 0, false),
    ];
    s.plate = { ayam: 1, kambing: 0, sauce: 1, lontong: 0, drink: 0, kerupuk: 1 };
    s.toast = 'Paused — the skewers wait for no one!';
    s.toastT = 99;
    s.lastServedHappy = false;
    return { screen: 'paused', best: 0, ui: { title: 0, pause: 1, howto: false } };
  } else if (name === '5') {
    // Shot A (v2): OPENING — fresh board, four distinct faces, empty grill,
    // timer at 3:00, $0, combo x0.
    s.timeLeft = 180;
    s.coins = 0;
    s.combo = 0;
    s.served = 0;
    s.orders = [
      order(random, 'Sate Ayam + Lontong', C[0], { ayam: 2, sauce: 1, lontong: 1 }, 16, 0.95),
      order(random, 'Sate Kambing + Es Teh', C[1], { kambing: 2, sauce: 1, drink: 1 }, 18, 0.9),
      order(random, 'Sate Campur Spesial', C[2], { ayam: 1, kambing: 1, sauce: 1, lontong: 1, drink: 1 }, 22, 0.88),
      order(random, 'Sate Ayam Jumbo + Es Teh', C[3], { ayam: 3, sauce: 1, drink: 1 }, 20, 0.85),
    ];
    s.grill = [
      slot(null, 0, false),
      slot(null, 0, false),
      slot(null, 0, false),
      slot(null, 0, false),
    ];
    s.plate = { ayam: 0, kambing: 0, sauce: 0, lontong: 0, drink: 0, kerupuk: 0 };
    s.toast = 'Welcome to Sate Senja! Grill, sauce, plate, serve!';
    s.toastT = 99;
    s.lastServedHappy = false;
    s.bubble = 'Maya: “First order of the night!”';
  } else if (name === '6') {
    // Shot B (v2): PEAK RUSH — two HURRY tickets, grill at FLIP! / READY! /
    // BURNING!, plate mid-assembly with sauce drizzle + lontong cubes.
    s.timeLeft = 122;
    s.coins = 245;
    s.combo = 6;
    s.served = 11;
    s.orders = [
      order(random, 'Sate Kambing Jumbo + Es Teh', C[4], { kambing: 3, sauce: 1, drink: 1 }, 21, 0.15),
      order(random, 'Sate Campur Spesial', C[0], { ayam: 1, kambing: 1, sauce: 1, lontong: 1, drink: 1 }, 22, 0.22),
      order(random, 'Sate Ayam Jumbo + Es Teh', C[1], { ayam: 3, sauce: 1, drink: 1 }, 20, 0.4),
      order(random, 'Sate Kambing + Es Teh', C[5], { kambing: 2, sauce: 1, drink: 1 }, 18, 0.55),
    ];
    s.grill = [
      slot('ayam', 5.5, false),
      slot('kambing', 5.8, false),
      slot('ayam', 11.0, true),
      slot('kambing', 13.6, true),
    ];
    s.plate = { ayam: 1, kambing: 1, sauce: 1, lontong: 1, drink: 0, kerupuk: 0 };
    s.toast = 'Peak rush! Two customers about to walk away!';
    s.toastT = 99;
    s.lastServedHappy = false;
  } else if (name === '7') {
    // Shot C (v2): SERVING PAYOFF — Sari (headscarf) happy, big tip, plate
    // FULL: skewers + sauce drizzle + lontong cubes + drink glass.
    s.timeLeft = 96;
    s.coins = 289;
    s.combo = 7;
    s.served = 14;
    s.orders = [
      order(random, 'Sate Campur Spesial', C[2], { ayam: 1, kambing: 1, sauce: 1, lontong: 1, drink: 1 }, 22, 0.85),
      order(random, 'Sate Ayam Jumbo + Es Teh', C[3], { ayam: 3, sauce: 1, drink: 1 }, 20, 0.62),
      order(random, 'Sate Kambing Jumbo + Es Teh', C[4], { kambing: 3, sauce: 1, drink: 1 }, 21, 0.48),
    ];
    s.grill = [
      slot('kambing', 10.4, true),
      slot('ayam', 3.2, false),
      slot(null, 0, false),
      slot('ayam', 5.6, false),
    ];
    s.plate = { ayam: 1, kambing: 1, sauce: 1, lontong: 1, drink: 1, kerupuk: 0 };
    s.fx = [{ x: 640, y: 318, text: '+$34  (tip $12)', life: 1.6, color: '#2c7a32' }];
    s.toast = 'Sari loved it! Combo x7 — best shift yet!';
    s.toastT = 99;
    s.lastServedHappy = true;
  } else if (name === '8') {
    // Shot D (v2): END OF SHIFT — 5 seconds left, LAST ORDERS!, one burnt
    // skewer (smoke stays inside its slot), happy Maya up front.
    s.timeLeft = 5;
    s.coins = 312;
    s.combo = 5;
    s.served = 15;
    s.orders = [
      order(random, 'Sate Ayam + Lontong', C[0], { ayam: 2, sauce: 1, lontong: 1 }, 16, 0.72),
      order(random, 'Sate Ayam Jumbo + Es Teh', C[1], { ayam: 3, sauce: 1, drink: 1 }, 20, 0.12),
      order(random, 'Sate Kambing + Lontong', C[3], { kambing: 2, sauce: 1, lontong: 1 }, 19, 0.45),
      order(random, 'Sate Campur Spesial', C[4], { ayam: 1, kambing: 1, sauce: 1, lontong: 1, drink: 1 }, 22, 0.88),
    ];
    s.grill = [
      slot('kambing', 15.5, true),
      slot('ayam', 8.0, true),
      slot('kambing', 10.5, true),
      slot(null, 0, false),
    ];
    s.plate = { ayam: 1, kambing: 0, sauce: 1, lontong: 1, drink: 1, kerupuk: 0 };
    s.toast = 'LAST ORDERS! 5 seconds left — serve it!';
    s.toastT = 99;
    s.lastServedHappy = false;
    s.bubble = 'Maya: “One more plate — you can do it!”';
  } else if (name === '2') {
    // Mid-rush: a dish mid-assembly, grill at four different stages, one
    // skewer a breath from burning, one ticket running low on patience.
    s.timeLeft = 98;
    s.coins = 147;
    s.combo = 3;
    s.served = 7;
    s.orders = [
      order(random, 'Sate Campur Spesial', C[0], { ayam: 1, kambing: 1, sauce: 1, lontong: 1, drink: 1 }, 22, 0.62),
      order(random, 'Sate Ayam + Lontong', C[1], { ayam: 2, sauce: 1, lontong: 1 }, 16, 0.81),
      order(random, 'Sate Kambing + Es Teh', C[2], { kambing: 2, sauce: 1, drink: 1 }, 18, 0.18),
      order(random, 'Sate Ayam Jumbo + Es Teh', C[3], { ayam: 3, sauce: 1, drink: 1 }, 20, 0.45),
    ];
    s.grill = [
      slot('ayam', 2.5, false),
      slot('kambing', 5.5, false),
      slot('ayam', 11.5, true),
      slot('kambing', 13.2, true),
    ];
    s.plate = { ayam: 2, kambing: 0, sauce: 1, lontong: 0, drink: 0, kerupuk: 0 };
    s.toast = 'Plate the skewers, add lontong, then SERVE!';
    s.toastT = 99;
    s.lastServedHappy = false;
  } else if (name === '3') {
    // Serving payoff: a finished plate, coins popping, a happy customer.
    s.timeLeft = 131;
    s.coins = 210;
    s.combo = 4;
    s.served = 10;
    s.orders = [
      order(random, 'Sate Kambing + Es Teh', C[2], { kambing: 2, sauce: 1, drink: 1 }, 18, 0.9),
      order(random, 'Sate Ayam + Lontong', C[0], { ayam: 2, sauce: 1, lontong: 1 }, 16, 0.7),
      order(random, 'Sate Campur Spesial', C[3], { ayam: 1, kambing: 1, sauce: 1, lontong: 1, drink: 1 }, 22, 0.55),
    ];
    s.grill = [
      slot('ayam', 3.0, false),
      slot('kambing', 10.2, true),
      slot(null, 0, false),
      slot('ayam', 6.1, true),
    ];
    s.plate = { ayam: 0, kambing: 2, sauce: 1, lontong: 0, drink: 1, kerupuk: 0 };
    s.fx = [{ x: 666, y: 318, text: '+$27  (tip $9)', life: 1.6, color: '#2c7a32' }];
    s.toast = 'Sari loved it! Combo x4 — keep the rush going!';
    s.toastT = 99;
    s.lastServedHappy = true;
  } else if (name === '4') {
    // Late rush: 41 seconds left, combo x5, a burnt skewer smoking, one
    // ticket about to walk away.
    s.timeLeft = 41;
    s.coins = 268;
    s.combo = 5;
    s.served = 13;
    s.orders = [
      order(random, 'Sate Ayam Jumbo + Es Teh', C[1], { ayam: 3, sauce: 1, drink: 1 }, 20, 0.12),
      order(random, 'Sate Kambing + Lontong', C[3], { kambing: 2, sauce: 1, lontong: 1 }, 19, 0.38),
      order(random, 'Sate Ayam + Lontong', C[0], { ayam: 2, sauce: 1, lontong: 1 }, 16, 0.66),
      order(random, 'Sate Campur Spesial', C[2], { ayam: 1, kambing: 1, sauce: 1, lontong: 1, drink: 1 }, 22, 0.84),
    ];
    s.grill = [
      slot('kambing', 15.5, true),
      slot('ayam', 4.2, false),
      slot('ayam', 9.8, true),
      slot('kambing', 1.1, false),
    ];
    s.plate = { ayam: 0, kambing: 2, sauce: 0, lontong: 0, drink: 1, kerupuk: 0 };
    s.toast = '41 seconds left! That burnt skewer goes in the bin!';
    s.toastT = 99;
    s.lastServedHappy = false;
  } else {
    // Shot 1 (default): early shift, full board, first skewers on the fire.
    s.timeLeft = 165;
    s.coins = 24;
    s.combo = 0;
    s.served = 1;
    s.orders = [
      order(random, 'Sate Ayam + Lontong', C[0], { ayam: 2, sauce: 1, lontong: 1 }, 16, 0.92),
      order(random, 'Sate Kambing + Es Teh', C[1], { kambing: 2, sauce: 1, drink: 1 }, 18, 0.78),
      order(random, 'Sate Campur Spesial', C[2], { ayam: 1, kambing: 1, sauce: 1, lontong: 1, drink: 1 }, 22, 0.65),
      order(random, 'Sate Ayam Jumbo + Es Teh', C[3], { ayam: 3, sauce: 1, drink: 1 }, 20, 0.5),
    ];
    s.grill = [
      slot('ayam', 2.0, false),
      slot('kambing', 5.2, false),
      slot(null, 0, false),
      slot(null, 0, false),
    ];
    s.plate = { ayam: 0, kambing: 0, sauce: 0, lontong: 0, drink: 0, kerupuk: 0 };
    s.toast = 'Welcome to Sate Senja! Grill, sauce, plate, serve!';
    s.toastT = 99;
    s.lastServedHappy = false;
  }
  return { screen: 'play', best: 0, ui: { title: 0, pause: 0, howto: false } };
}

export { createWorld };
export { GRILL };
