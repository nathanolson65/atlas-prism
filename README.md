# ATLAS Prism — laser-projection visualizer (PWA)

A single-file, installable mobile PWA that turns any song into a live, music-reactive
geometric light show — the controller HUD for a custom prism-laser table.

**Open it / install it:** visit the GitHub Pages URL, then on your phone tap
**Share → Add to Home Screen** (iOS) or **Install** (Android).

- 42 visual patterns incl. a **GPU · WebGL** class (Julia, Mandelbox, fluid sim,
  reaction-diffusion, 65k-particle curl-noise, and more), all audio-reactive.
- **Music (no server needed):** Audius + Internet Archive + Jamendo play full songs
  straight from the browser. YouTube full-song search needs a separate bridge
  (`serve.js` + yt-dlp) — set its URL in **Settings → YouTube bridge** when you have one running.

All client-side (Canvas2D / WebGL / Web Audio). No build step, no tracking, free.
