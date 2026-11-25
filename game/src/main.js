// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps, and the renderer paints what is there. The game moves
// between four screens — title, play, paused and game over — plus a How to
// Play panel that opens from the title screen or from pause. Every menu is
// a real list of options: clickable AND keyboard-navigable (arrow keys,
// number keys, Enter/Space to pick).
//
// ?seed=N fixes the customer and order pattern. ?shot=1..18 (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, FIELD, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_OVER } from './world.js';
import { ACTION_CONFIRM, ACTION_PAUSE, createInput } from './input.js';
import { MENU_ZONES, createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
canvas.width = FIELD.width;
canvas.height = FIELD.height;
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best then lasts this visit.
  }
}

function inZone(c, z) {
  return c && c.x >= z.x && c.x <= z.x + z.w && c.y >= z.y && c.y <= z.y + z.h;
}

function runShot(name) {
  const scene = stageShot(name, world, createRandom(seed));
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, scene.ui || {});
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  // Menu state: which option is highlighted on each screen, and whether the
  // How to Play panel is open (and which screen opened it).
  const ui = { title: 0, pause: 0, howto: false, howtoFrom: 'title' };

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Serve customers before their patience runs out.');
  }

  function backToMenu() {
    screen = SCREEN_TITLE;
    ui.title = 0;
    announce('Sate Senja. Press Space or click to start your shift.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.coins > best) {
      best = world.state.coins;
      saveBest(best);
    }
    announce(`Shift over. You earned ${world.state.coins} coins. Best ${best}.`);
  }

  function openHowTo(from) {
    ui.howto = true;
    ui.howtoFrom = from;
    announce('How to play. Press Escape or B, or click BACK, to go back.');
  }

  function closeHowTo() {
    ui.howto = false;
    announce(ui.howtoFrom === 'pause' ? 'Paused.' : 'Sate Senja menu.');
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;

    const actions = input.takeActions();
    const clicks = input.takeClicks();

    if (ui.howto) {
      // How to Play is open: BACK (click / Enter / Esc / P / B) closes it.
      const back = clicks.some((c) => inZone(c, MENU_ZONES.howtoBack));
      if (back || (actions & (ACTION_CONFIRM | ACTION_PAUSE)) || input.pressed('b')) closeHowTo();
    } else if (screen === SCREEN_TITLE) {
      if (input.pressed('arrowup') || input.pressed('arrowdown')) ui.title = 1 - ui.title;
      if (input.pressed('1')) startGame();
      else if (input.pressed('2')) openHowTo('title');
      else if (clicks.some((c) => inZone(c, MENU_ZONES.titleStart))) startGame();
      else if (clicks.some((c) => inZone(c, MENU_ZONES.titleHowto))) openHowTo('title');
      else if (actions & ACTION_CONFIRM) {
        if (ui.title === 0) startGame();
        else openHowTo('title');
      }
    } else if (screen === SCREEN_PLAY) {
      if (actions & ACTION_PAUSE) {
        screen = SCREEN_PAUSED;
        ui.pause = 0;
        announce('Paused.');
      } else {
        // Clicks go to the world exactly once, on the first fixed step.
        let pendingClicks = clicks;
        while (accumulator >= STEP) {
          const events = world.step(STEP, pendingClicks, input);
          pendingClicks = [];
          accumulator -= STEP;
          if (events & EVENT_OVER) {
            endGame();
            break;
          }
        }
      }
    } else if (screen === SCREEN_PAUSED) {
      if (input.pressed('arrowup')) ui.pause = (ui.pause + 2) % 3;
      if (input.pressed('arrowdown')) ui.pause = (ui.pause + 1) % 3;
      const pick = input.pressed('1') ? 0 : input.pressed('2') ? 1 : input.pressed('3') ? 2 : -1;
      const clicked = clicks.findIndex((c) =>
        inZone(c, MENU_ZONES.pauseResume) || inZone(c, MENU_ZONES.pauseRestart) || inZone(c, MENU_ZONES.pauseHowto));
      const choice = pick >= 0 ? pick
        : clicked >= 0 ? (inZone(clicks[clicked], MENU_ZONES.pauseResume) ? 0
          : inZone(clicks[clicked], MENU_ZONES.pauseRestart) ? 1 : 2)
        : (actions & ACTION_CONFIRM) ? ui.pause : -1;
      if (choice === 0 || (actions & ACTION_PAUSE)) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      } else if (choice === 1) {
        startGame();
      } else if (choice === 2) {
        openHowTo('pause');
      }
    } else if (screen === SCREEN_OVER) {
      if (clicks.some((c) => inZone(c, MENU_ZONES.overAgain))) startGame();
      else if (clicks.some((c) => inZone(c, MENU_ZONES.overMenu))) backToMenu();
      else if (input.pressed('r') || (actions & ACTION_CONFIRM)) startGame();
      else if (input.pressed('m')) backToMenu();
    }

    if (screen === SCREEN_TITLE) {
      world.state.time += accumulator;
      accumulator = 0;
    } else if (screen !== SCREEN_PLAY) {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, ui);
  }

  // Leaving the tab pauses a running game rather than letting orders rot.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      ui.pause = 0;
      announce('Paused.');
    }
  });

  announce('Sate Senja. Press Space or click to start your shift.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
