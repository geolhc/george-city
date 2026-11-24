# Audit-driven priorities and V0.2 backlog
Priorities use the foundation request's definitions, replacing the earlier audit scale.
P0: malformed saves can crash journal/driving — addressed with nested validation,
backup recovery and future-version protection. No verified security incident.
P1: inconsistent arcade vehicle performance — addressed. Low-FPS time loss —
addressed for frames up to 250 ms. Mixed-device driving overspeed — addressed.
P1: missing PR validation — addressed with a separate non-deploying workflow.
P2: undersized menu targets — enlarged. Existing camera and collision behavior
preserved because replacement is not justified by current test evidence.
P2 remaining: NPC paths outside walkable boundaries, duplicated identities,
audio preferences, parked headings, outfit sleeves, favicon, save recovery UI.
P1 before V0.2: actual driven-lap and navigation tests, simultaneous touch/look,
real iOS/Android camera and performance profiling, stronger collision coverage.
P1 before expansion: stable mission IDs with migration fixtures, activity lifecycle.
P3: interiors, second district, events, collectibles, richer NPCs, private rooms,
AI dialogue. No backend or large map belongs in this foundation release.

V0.2: finish those quality gates, extract mission/activity definitions incrementally,
then add one contained indoor arcade experience to validate entry and return.
Acceptance: all five missions, cancellation, replay and reload preserve unlocks;
race handling independent of street-car history; no stuck touch controls.
Choose baseline devices before setting measured 30 FPS mobile / 60 FPS desktop goals.
