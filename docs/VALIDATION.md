# City in Motion

Tested on 25 November 2026 (Hong Kong) using Node 24.22.3 and Chromium 156
with SwiftShader. The base was `1ab150b`, which includes the merged Task A
release and its validation record.

| Check | Result |
| --- | --- |
| Simulation and production build | All 15 tests passed. TypeScript and Vite built successfully. The static build loaded from a Pages-style subdirectory, including both lazy activity chunks. |
| PLAYVERSE and NOVA SYNC | Walked to the doorway with Neon Postcards active. Played through the 48-second chart with a controlled browser clock, earned the resonance chip, restarted and exited via Escape. Verified that position, mission time and world clock stayed fixed inside. |
| Rendering and audio lifecycle | Counted zero city WebGL draw calls and zero new music notes after entering the activity. Game sound effects played when enabled. City draw calls and music resumed on exit. The activity countdown stayed fixed while paused. |
| Exploration and City ID | Scanned the arcade with Q and the café with touch. Checked the scan log, XP, collectible and personal best after reload. Collapsed and disabled NOVA. Unit coverage found all eight discoveries and confirmed stamps award XP once. |
| Café and device layouts | Tapped an incorrect order and checked its feedback, then served all five orders and earned the night-shift token in portrait. Started a round and returned using landscape touch controls. Both layouts fit their tested viewports. |
| City Pulse and residents | Used position fixtures to interact at each delivery and energy stop, reloading between stages. Verified parcel pickup, delivery, incorrect and correct frequencies, progression, and the courier's response. Simulations covered repeat clears and a full scheduled resident day. |
| Legacy gameplay smoke | Both desktop and touch sessions passed with zero reported browser errors. The run covered keyboard movement, simultaneous touch movement and camera drag, all five commissions, street driving and outfit unlocks. |
| Save migration | Loaded a legacy version-1 save without the new `city` data. Credits, mission records, wardrobe and discoveries survived activity entry and exit. The foreground commission and city position survived the arcade round. Backup recovery and future-version guards passed. |

## Gameplay captures

The images come from the production build. Café devices are emulated.
The arcade and café captures use position fixtures to frame the entrances.

| Gameplay | Capture |
| --- | --- |
| PLAYVERSE | [Street entrance](screens/city-in-motion/playverse-entrance.jpg) · [NOVA SYNC in play](screens/city-in-motion/nova-sync.jpg) |
| City Scan and City ID | [World scan](screens/city-in-motion/city-scan.jpg) · [Activity record and collectible](screens/city-in-motion/city-id.jpg) |
| Moontide Café | [Street entrance](screens/city-in-motion/moontide-cafe-entrance.jpg) · [Portrait](screens/city-in-motion/cafe-portrait.jpg) · [Landscape](screens/city-in-motion/cafe-landscape.jpg) |

## Performance

The main JavaScript entry was 319.47 kB gzip, up from 311.23 kB. NOVA SYNC
loads 2.82 kB gzip of game code on demand. The café loads 2.84 kB of game
code and 1.31 kB of styles. The clock module shared by both is 0.36 kB.
The expanded Hong Kong font subset decreased from 169.66 kB to 135.81 kB
after switching to WOFF2. Vite still reports the large Babylon entry chunk.

At spawn, the WebGL probe sampled 24 frames per build after eight frames
at a 416 × 250 render buffer and a 1000 × 600 CSS-pixel viewport. Both
SwiftShader runs measured a median of 88 draw calls for Task A and 95 for
City in Motion. The median interval was 183 ms for Task A in both runs
and 183–208 ms for City in Motion. Time to the first action prompt ranged
from 4.87 to 7.53 seconds on Task A and 3.09 to 3.24 seconds on City in
Motion. Startup varies with cache, shader compilation and host load.
These samples describe software rendering on the test host.

## Qualification limits

Browser qualification used software rendering and emulated touch. Physical
iOS and Android devices, Safari, hardware frame pacing, and speaker or
Bluetooth timing remain unverified. Venue and commission fixture checks do
not cover every walking route. Inspect the Task A gate below for the
separate continuously driven circuit check. Optional Cantonese speech
uses a compatible device voice.

# V0.2 Task A final gate

25 November 2026 (Hong Kong). Tested the merged New Horizon release at `449bd7e` using a clean dependency install, node 24.22.3 and Chromium 156 with SwiftShader.

**Gate result:** Pass for the tested release. Desktop and emulated mobile production smoke both completed with zero reported browser errors. The review changes are documentation and captured evidence.

## Evidence

| Area | Check and result |
| --- | --- |
| Branding and street | The title and HUD identify GEORGE CITY 2099, New Horizon and Moontide. The south-gate crescent, bilingual signs, amber shop interiors and cyan lighting follow the [art guide](NEW-HORIZON.md). |
| Movement and camera | Walked from spawn toward the first postcard by keyboard. Touch sessions combined forward joystick input with an independent camera drag. The movement tests cover sprint, building clearance, slide and bounded camera distance. |
| City OS | Opened the district map, selected the postcard commission in Activities, toggled reduced motion, resumed the active mission after reload and cancelled through the journal. |
| City ID | A continuous keyboard-driven lap from a seeded arcade entrance crossed all four required gates. City ID then displayed Tidewalker, 150 credits, 1/5 commissions, the mint outfit and Midnight Driver achievement. |
| Activities and saves | The production smoke walks to the first landmark and uses position fixtures for the five commission completions, puzzle, car entry/exit and outfit selection. It checks the 540-credit total, three discoveries and unlocked silver outfit. Unit coverage includes version-1 saves, stage reloads, replay rewards, backup recovery and future-version write protection. |
| Build and hosting | `npm ci`, all eight automated tests and `npm run build` passed. Main entry 1,256.14 kB minified, 311.23 kB gzip. The published entry JS and CSS matched the locally built files byte for byte. The [merge deployment](https://github.com/geolhc/george-city/actions/runs/45444122927) passed. |

A separate compatibility check generated a progressed save using the actual foundation writer at `f81ca3d`. V0.2 loaded the active Lost in Transit mission, displayed the three earned landmarks, coral outfit, collector achievement and 80 credits in City ID, and retained progression and parked vehicles across reload.

## Gameplay captures

Fresh production-build sessions, after starting Neon Postcards and moving. Touch captures use emulated viewports. The desktop mission tracker leaves the centre sightline clear. Both touch layouts keep the joystick and sprint control reachable at opposite edges. The portrait City ID stays within the viewport with a visible close control. Decorative road traffic can briefly cross the camera foreground.

| Desktop · 1100 × 680 | Portrait · 390 × 844 | Landscape · 844 × 390 |
| --- | --- | --- |
| [Gameplay](screens/task-a-gate/desktop.jpg) | [Gameplay](screens/task-a-gate/portrait.jpg) · [City ID](screens/task-a-gate/city-id.jpg) | [Gameplay](screens/task-a-gate/landscape.jpg) |

## Qualification limits

Physical iOS/Android devices, Safari, sustained thermals and hardware frame pacing remain untested. The earlier single SwiftShader startup comparison reached the first mission prompt in 6.56 s on V0.2 and 1.53 s on the foundation. The large-entry warning persists. A phone cold-start measurement remains the first performance follow-up. Street traffic is decorative and camera collision uses building footprints. Position fixtures cover mission interactions and rewards; only the first postcard approach and the circuit received continuous route checks in this gate.

## Foundation validation (historical)
Environment: Node 24.22.3; CI is configured for Node 22.
Eight simulation tests pass, covering existing missions/rewards/replay, collision,
dialogue, malformed saves, backup recovery, future versions, fixed timing,
mixed input and race configuration. TypeScript/Vite production build passes.
Vite still warns about the large Babylon entry chunk; no bundle-size improvement
or hardware FPS improvement is claimed.

Before: 10 FPS advanced 0.65 game seconds per wall second. After: tested 10, 30
and 60 FPS each advance one game second; stalls beyond 250ms are deliberately capped.
Before: arcade boost depended on street-car selection. After: both selections use GT.
Before: malformed record values reached journal formatting. After: decoder rejects them.
Existing valid version-1 saves and first-clear rewards pass regression tests.

Browser command:
CITY_URL=http://127.0.0.1:4174 CITY_BROWSER=/usr/bin/chromium node scripts/smoke.cjs
Serve the completed dist directory before running. Do not rebuild during the run.
Uses software-rendered Chromium and desktop/mobile emulation, not physical devices.
Coverage: keyboard/touch movement, mission start, journal, reload, seeded desktop
completion of all five missions, car entry/exit and cosmetics.
Camera wall clearance is simulation-tested; camera feel, NPC interaction UI,
full navigation, full driven lap and simultaneous multi-touch remain release
qualification gaps. No measured real-device performance is available.

Final settled-build smoke run: PASS desktop and emulated mobile. Desktop reported
only the existing favicon 404; mobile reported no console errors. An earlier run
timed out while the build was being replaced; a complete rerun passed.
Main JS: 1,252.31 kB minified / 309.52 kB gzip. This is a reliability release,
not a demonstrated rendering-performance optimization.
