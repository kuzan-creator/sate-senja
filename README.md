# Sate Senja — Satay Grill Rush

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/kuzan-creator/sate-senja/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/kuzan-creator/sate-senja/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

An original cooking game built for make.fun's **"Make the best cooking game"** bounty ($250 in USDC).

## The game

Run an Indonesian night-market satay stall at dusk. Walk-up customers pin
their orders to the board; you grill skewers over charcoal, flip them at the
right moment, drown them in peanut sauce, add lontong, kerupuk and es teh, and
serve before patience runs out. The menu has 11 dishes (see How to Play in
the game for the full list with prices); the title screen, pause menu and
game-over screen are all real menus with clickable, keyboard-navigable
options — START SHIFT / HOW TO PLAY, RESUME / RESTART SHIFT / HOW TO PLAY,
PLAY AGAIN / BACK TO MENU.

- **Order board** — 4 customer tickets with dish, patience bar and price
- **Grill** — 4 charcoal slots; skewers go raw → flip → perfect (green) → burnt
- **Sauce pot** — peanut sauce, **Lontong** — rice cakes, **Kerupuk** — crunchy
  crackers, **Drink station** — es teh
- **Plating counter** — build the dish on the plate, then SERVE for coins + tips
- **Shift timer** — 3 minutes; combo meter rewards serving streaks

## Play

Open `game/index.html` in desktop Chrome (or serve the `game/` folder with any
static server). No build step, no network requests, all art drawn in code,
sounds are tiny WebAudio bleeps.

- **Mouse:** click a tray pile, then an empty grill slot; click a skewer to flip
  it, click it again at green to plate it; click sauce / lontong / kerupuk /
  drink to add them; click a ticket (or SERVE) to serve a matching plate.
- **Keyboard:** `1–4` grill slots, `A`/`G` pick chicken/goat, `S` sauce,
  `L` lontong, `D` drink, `K` kerupuk, `Space` serve, `P` pause, `R` play again
  after a shift, `M` back to menu. Arrow keys + Enter navigate every menu.

## Layout

- `game/index.html` + `game/src/` — the game (config, world rules, renderer,
  input, audio, screenshot scenes)
- `main.ts` — hands the game in: copies `game/` + `screenshots/` to `/output`
  and writes `dossier.json` with the vendored make.fun library
- `screenshots/` — 4 real renders of the game's own code in desktop Chrome
- `vendor/makefun-game.ts` — the kit's library, unchanged

## License

MIT — see [LICENSE](LICENSE).
