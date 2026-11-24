# Foundation validation
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
