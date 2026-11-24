# Nova Harbour — 新港

At blue hour in 2099, light from the tea counters falls across the pavement beneath the south gate. Its upturned roof borrows its section from a ferry sail. The narrow upper galleries belong to the people living over the shops. The harbour-facing end of the road opens onto the ferry and its lit cabin.

### First visit

Start at the postcard ring. Press E or tap its Cantonese action label to accept. Cross to the first arch and interact to record the first photo in City ID. Ah Ching walks along the west pavement and remembers repeat conversations. The remaining two photos lead past the street cinema to the pier. Open City OS to mark another activity or leave the current commission.

### Reusable asset guidelines

Keep the street’s axial view open. Use low amber counter lighting for occupied premises, pearl trim for roof edges and cyan for navigation. Repeat timber mullions and canopy pleats at pedestrian scale. Place planter troughs behind the gallery edge so foliage reads against the sky. Reserve violet for the moonwheel and arcade. Use the sign painter for Traditional Chinese display lettering and a smaller English line. Check glyphs on the actual 3D panel.

Author fixed details through the seeded scene builder and its thin-instance batches. Reuse materials across buildings. Use transform nodes only for moving parts. Align walkable footprints with world.ts and keep decorative structures clear of mission sites. Unit scale is approximately one metre.

All new storefronts, ferry, roof structures, paint schemes, clothing and signs are original code-authored assets in src/view.ts. Character motion uses the existing hierarchical procedural rig. No downloaded character mesh or AI image is used. The bundled district font carries its upstream terms in public/FONT-LICENSE.txt. Babylon.js is Apache-2.0.

### District atlas

| District | Direction |
| --- | --- |
| Moontide | Hong Kong-inspired harbour culture, commissions and street life. Playable now. |
| Playverse | Neighbourhood arcades and mini-games with explicit entry, rewards and return. |
| Velocity Zone | Futuristic mobility and closed-course racing. |
| Sky Habitat | Personal homes and daily life above the street. |
| Nexus Central | Invite-only social and multiplayer experiences. |
| Synth District | Intelligent residents and interactive stories. |
| Horizon Terminal | Travel between future cities. |

The last six entries are planning concepts. Use the existing dialogue provider and input command boundary for future extensions. Define district loading and disposal when a second playable district exists.

### Gameplay comparison

Fresh saves at the south gate, default camera, Chromium with SwiftShader. Moving traffic and residents may differ between frames.

| Viewport | Foundation | New Horizon |
| --- | --- | --- |
| Desktop, 1100 × 680 | [Before](screens/before-desktop.jpg) | [After](screens/after-desktop.jpg) |
| Portrait, 390 × 844 | [Before](screens/before-portrait.jpg) | [After](screens/after-portrait.jpg) |
| Landscape, 844 × 390 | [Before](screens/before-landscape.jpg) | [After](screens/after-landscape.jpg) |

### Build and rendering observations

The merged foundation at f81ca3d passed its main build. Its PR runner failed installing Playwright FFmpeg on Ubuntu 26.04. The V0.2 PR workflow pins Ubuntu 24.04. Local npm ci, eight simulation tests, strict TypeScript and the production Vite build passed.

The main entry grew from 309.52 to 311.23 kB gzip. Vite still flags the Babylon entry chunk. The new street furniture, roof and ferry use the existing static instance batches. Four distinct authored residents replace eight walkers that repeated the same four identities. Adaptive resolution remains active. No physical device or hardware GPU measurements are available.

The local ID uses the fictional callsign Tidewalker and reads the current version-1 save. Motion preference is stored separately. Traffic remains decorative. Camera clearance covers building footprints; overhanging trim is visual geometry. Physical touch comfort, hardware frame pacing and thermal behaviour on phones remain qualification gaps.


### Gameplay qualification

Production Chromium smoke coverage includes keyboard travel from spawn to the first postcard, mission resumption after reload, simultaneous touch joystick and drag-to-look input, all five mission completions, puzzle relays, the garage, first-clear rewards and outfit changes. The all-commission test seeds positions between objectives. An additional browser run started at the arcade entrance and drove the circuit continuously using throttle and steering keyboard events. It crossed all four required gates, returned to the street and awarded 150 credits. This verifies the route and reward with automated steering.

All three viewport sessions opened City OS, inspected the local identity and started Neon Postcards. Screenshot review prompted a higher walking-camera sightline so the new gate roof reads from spawn and separate lamp, counter and mullion geometry so the tea-house windows have depth.

Profiling first found a frame-time regression on SwiftShader. Moving parts now share Babylon mesh instances by shape and material, except the player’s recolourable outfit. At the same 416-pixel render-buffer width, a 45-frame spawn sample after 15 warm-up frames counted 303 median WebGL draw calls on the foundation and 88 after batching. The gate silhouette and small marker rings also use fewer segments. Draw-call counts describe renderer workload; software timings vary with host load.
