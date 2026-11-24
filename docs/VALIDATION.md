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
