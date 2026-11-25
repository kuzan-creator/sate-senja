// The screenshot scenes behind ?shot=1|2|3|4. Each one stages a real world
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
    { name: 'Maya', skin: '#f2c89b', shirt: '#e4572e', hair: '#2b1d16' },
    { name: 'Budi', skin: '#d9a066', shirt: '#2e86ab', hair: '#17120e' },
    { name: 'Sari', skin: '#eec39a', shirt: '#f2a541', hair: '#3a2417' },
    { name: 'Agus', skin: '#c98d54', shirt: '#4caf50', hair: '#100c09' },
  ];

  if (name === '2') {
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
      order(random, 'Sate Ayam Jumbo', C[3], { ayam: 3, sauce: 1, drink: 1 }, 20, 0.45),
    ];
    s.grill = [
      slot('ayam', 2.5, false),
      slot('kambing', 5.5, false),
      slot('ayam', 11.5, true),
      slot('kambing', 13.2, true),
    ];
    s.plate = { ayam: 2, kambing: 0, sauce: 1, lontong: 0, drink: 0 };
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
    s.plate = { ayam: 0, kambing: 2, sauce: 1, lontong: 0, drink: 1 };
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
      order(random, 'Sate Ayam Jumbo', C[1], { ayam: 3, sauce: 1, drink: 1 }, 20, 0.12),
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
    s.plate = { ayam: 0, kambing: 2, sauce: 0, lontong: 0, drink: 1 };
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
      order(random, 'Sate Ayam Jumbo', C[3], { ayam: 3, sauce: 1, drink: 1 }, 20, 0.5),
    ];
    s.grill = [
      slot('ayam', 2.0, false),
      slot('kambing', 5.2, false),
      slot(null, 0, false),
      slot(null, 0, false),
    ];
    s.plate = { ayam: 0, kambing: 0, sauce: 0, lontong: 0, drink: 0 };
    s.toast = 'Welcome to Sate Senja! Grill, sauce, plate, serve!';
    s.toastT = 99;
    s.lastServedHappy = false;
  }
  return { screen: 'play', best: 0 };
}

export { createWorld };
export { GRILL };
