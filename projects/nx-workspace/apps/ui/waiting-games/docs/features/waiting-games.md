# Waiting Games

Passive, no-input games for `waiting.harryliu.dev`. Rounds start on load and cycle forever; viewers think of an answer and watch it be revealed.

## Table of Contents

- [Round flow](#round-flow)
- [Games](#games)
- [Variety](#variety)
- [Settings](#settings)
- [Reaching the controls](#reaching-the-controls)
- [Pause, background tabs and motion](#pause-background-tabs-and-motion)
- [Question bank](#question-bank)
- [Manual verification](#manual-verification)

## Round flow

Every round runs four phases in order, driven by one clock (`engine/player.ts`, ticked by `hooks/useWaitingGame.ts`):

| Phase  | Length                               | What is on screen                                 |
| ------ | ------------------------------------ | ------------------------------------------------- |
| Watch  | Per round (`promptMs`, about 5–10 s) | Question, statement, objects, or ball and shuffle |
| Think  | Setting, default 8 s                 | Prompt to guess, countdown                        |
| Answer | Setting, default 6 s                 | Highlighted answer and explanation                |
| Next   | Setting, default 3 s                 | Answer stays up, then the next round begins       |

A phase's length is fixed when it starts, so a settings change never resizes the phase on screen. It applies from the next phase to start. The progress bar shows the four phases proportionally with a seconds countdown.

## Games

- **Cup and ball** (`engine/cup-round.ts`): cups keep an identity and a swap exchanges the slots two cups occupy, tracked in `layouts[step][cup]`. The ball is rendered inside its cup's wrapper so it travels with it, and the answer slot is read from the last layout. 5–7 swaps.
- **Quiz** (`engine/quiz-rounds.ts`): four options shuffled per round, `correctIndex` read after the shuffle. Options appear staggered during Watch.
- **True or false**: statement, two answer tiles, explanation on reveal.
- **Estimation** (`engine/estimation-round.ts`): objects are placed by rejection sampling so they do not overlap. The answer is `objects.filter(kind === target).length` of the generated array, never a separately chosen number. About a third of rounds add a different distractor kind to ignore. The reveal numbers the target objects one by one.

Cup timing is a pure function of the elapsed time within Watch (`getCupStep`), so pausing freezes the animation at the right swap.

## Variety

`createShuffleBag` (`engine/random.ts`) draws each game type once per refill in random order and never starts a refill with the type that ended the previous one, so a type never repeats back to back. Questions and statements use their own bags, so none repeats until the bank is exhausted.

## Settings

Three bounded timing settings, persisted to `localStorage` under `waiting-games.settings` (`settings.ts` validates and clamps on read):

| Setting             | Meaning                                             | Default | Range |
| ------------------- | --------------------------------------------------- | ------- | ----- |
| Thinking time       | Time to think before the answer is revealed         | 8 s     | 3–30  |
| Answer reveal time  | How long the answer and explanation stay on screen  | 6 s     | 3–20  |
| Time between rounds | Pause after the reveal before the next round starts | 3 s     | 1–15  |

The dialog uses the shared `react-lib` `Dialog`. Number inputs keep a draft while typing and commit valid in-range values live; blur clamps. "Reset to defaults" restores the table above.

## Reaching the controls

Pause, skip and settings sit top-right and are invisible while watching:

- Mouse: they appear while the pointer is over the game surface.
- Keyboard: they are in the tab order and appear on focus.
- Touch (`hover: none`): they are always shown at reduced opacity, and a tap on the surface brightens them for 4 s.
- While paused they stay visible with a "Paused" badge.

## Pause, background tabs and motion

- Playback runs only while not paused by the user, the settings dialog is closed, and the tab is visible. Opening the dialog pauses; closing it resumes from the same instant.
- The interval is cleared whenever playback stops, and each tick's delta is capped (`MAX_TICK_DELTA_MS`) so a throttled timer cannot skip a round.
- `prefers-reduced-motion`: CSS animations and transitions are removed, cups jump between slots, and a caption names each swap ("Swapping the left and middle cups").
- The app is silent and has no audio.

## Question bank

`data/multiple-choice.bank.ts` and `data/true-false.bank.ts` are hand-maintained, English-only and outside i18n because they are content, not interface copy. Entries must be timeless, family-friendly and uncontested: avoid records, current events and anything that changes. Every entry carries an explanation. There is no runtime AI or third-party question API.

## Manual verification

- Load the page: a round starts with no input, and all four phases play in order with the bar advancing.
- Cup and ball: ball shows, cups cover it, the shuffle is followed by the correct cup lifting with the ball.
- Estimation: the number shown matches the count of numbered objects.
- Hover, Tab to, and (touch emulation) view the settings button; open it and confirm the round stops, close it and confirm it continues.
- Change each timing, reload, and confirm the values persisted and are clamped to their ranges.
- Switch to another tab for a minute and back: the round continues where it was.
