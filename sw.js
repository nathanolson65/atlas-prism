/* ATLAS Prism — cache-first service worker */
const CACHE = 'atlas-prism-v43';
/* v43 SEARCH GLITCH FIX: doSearch() rewritten — (1) a generation guard so a stale/superseded search can
   no longer wipe a good result list (this caused YouTube results to flash then vanish to "no matches");
   (2) PROGRESSIVE render — each engine's results appear as they arrive, Audius/Archive instantly while the
   remote YouTube bridge resolves (with a "Searching more…" note), and "No matches" shows only after ALL
   engines settle; (3) YouTube timeout raised 8s→22s for the tunnelled bridge; (4) the full-only filter now
   keeps any full source (incl. YouTube), not just Audius. */
/* v42 YOUTUBE-ON-MOBILE: the deployed site now defaults its YouTube bridge to the operator's tunnelled
   PC bridge (DEFAULT_BRIDGE in index.html) so YouTube full-song search works on the installed phone app
   whenever the PC + tunnel are running. Public Piped/Invidious instances were tested and can't extract
   audio (YouTube blocks datacenter IPs), so a residential-IP bridge (your PC, exposed via a tunnel) is the
   only reliable free path. Respects a user-set custom bridge in Settings; auto-updates across deploys. */
/* v41 STATIC-HOST DEPLOY: relative asset paths (manifest start_url './', SW ASSETS './…', offline
   fallback './index.html') so the PWA installs correctly under a subpath (e.g. <user>.github.io/atlas-prism/)
   as well as at localhost root. No visual changes — v40 feature set. On a static host the YouTube bridge is
   not present (search degrades to Audius + Internet Archive + Jamendo, which play full songs client-side);
   set a bridge URL in Settings (a tunnel / hosted bridge) to re-enable YouTube full-song search. */
/* v40 SOTA WAVE 6 — THE WEBGL GIANT (hardware GPU render path + GPU effects, all audio-reactive):
   a WebGL2 layer with an AUDIO TEXTURE (512x2 FFT+waveform) for per-pixel sync (#59) + a palette-aware
   uniform bus; each GPU effect renders to an offscreen GL canvas then composites into the 2D pipeline
   (so the cube refraction / pyramid / post-FX still apply). 11 GPU patterns: Spectral Bloom, JULIA set
   (#68), MANDELBOX/KIFS raymarch (#64), LASER WORMHOLE tunnel (#66), VORONOI spectrogram (#47), multiscale
   TRUCHET (#69), domain-warp MARBLE (#60), rising-fire FLAME (#67), GRAY-SCOTT reaction-diffusion sim (#62,
   RG16F ping-pong), STABLE-FLUID smoke sim (#61, 11-pass RGBA16F Navier-Stokes, audio-injected dye), and
   65,536-particle CURL-NOISE flow (#63, GPU state-texture sim + additive POINTS). Plus canvas LIQUID SKY
   (#39) and STEREO WIDTH (#41 — L/R channel-split feeds the refraction). **42 patterns total.** GPU effects
   designed via an 8-agent GLSL workflow, each pre-rendered + screenshot-verified clean (caught + fixed:
   Mandelbox glow blow-out, flat fractal-flame → rising fire, hazy tunnel → analytic wormhole, fluid speckle
   → wide bloom). Verified: all 42 patterns → 0 errors, 0 white-out, 0 dup IDs, 0 GL compile errors.
   Render res is capped + adaptiveQ-scaled; needs WebGL2 (degrades to a 2D notice if absent). */
/* v39 SOTA WAVE 5 (free-canvas, 12 effects): tempo-LFO bank w/ robust beat phase (#17) · sidechain
   DUCK (#25 — scene pumps on the kick) · audio-driven SYMMETRY (#12 — geometry gains mirror-arms on
   the drop, smoothed) · DOWNBEAT-snapped Auto-VJ/cycle switches (#21/#42) · new SCOPE pattern (#7 —
   true ~512-point oscilloscope, 30 patterns now) · KINETIC typography (#50 — now-playing title as
   reactive glyphs) · KEY/CHROMA mood colour (#28/#58/#71 — Krumhansl-lite key estimate biases hue:
   major warms, minor cools) · HPSS-lite drum/harmony split (#56 — percussion sharpens, harmony
   breathes) · WARP MESH (#46 — per-vertex liquid displacement grid) · DEPTH PLATES (#55 — 2.5D
   parallax, near=bass far=treble) · SCANLINE GLITCH + slit-scan (#43/#52 — waveform tears the frame)
   · OPTICAL-FLOW sparks (#45 — particles stream along the actual on-screen motion, 32x18 flow field).
   10 new Settings toggles, all default OFF. All Canvas2D, free. WebGL renderer giant is the next wave. */
/* v38 SOTA WAVE 4 (laser-authentic): two new patterns — BEAM TUNNEL (#34, radial guide beams + receding
   perspective rings, bass-pulsed) + LASER ABSTRACT (#36, a 2-axis oscillator-bank Lissajous traced as a
   glowing rainbow beam, frequencies modulated by the music) — and ONSET BEAM-BURST flares (#38, radial
   laser bursts on transients, toggle swBeamburst). 29 patterns total. All Canvas2D, free. */
/* v37 SOTA WAVE 3: shockwave rings (#32 — expanding rings on the kick, toggle swShock), two new patterns —
   METABALLS (#48, per-band screen-blended liquid blobs) + POLAR SPECTROGRAM (#27, concentric time-rings of
   the 24-band spectrum) — and a film-grain + vignette + halation post-FX stack (#49, toggle swGrain).
   27 patterns total. All Canvas2D, free. Waves 4 (WebGL) + remaining canvas-hard ideas next. */
/* v36 SOTA WAVE 2: audio-warped FEEDBACK warp (#5/#33 — MilkDrop-style flowing zoom/rotate of the persisted
   frame, bass zooms / treble swirls; toggle swFeedback), reactive trail decay (#8 — louder = longer trails),
   transient chromatic aberration (#11/#29 — RGB split POPS on onsets), and PER-BIN retrofit (#2) of 7
   patterns (prism, kaleid, tunnel, rays, mandala, starfield) so each element reacts to its OWN frequency
   band (fBands[i%NBANDS]) instead of one global bass. All Canvas2D, free. */
/* v35 SOTA WAVE 1 (detail foundation): a rich audio-feature engine computeFeatures() — 24-band log/AGC
   spectrum (#1), spectral-flux onsets (#3), kick/snare/hi-hat detection (#4), high-end-boosted "juiced"
   FFT (#9), per-band attack+peak envelopes (#23), spectral centroid/flatness (#6), RMS (#40), lite beat
   clock (#10), q-bus (#31). Wired: colour now timbre-painted (centroid→hue, flatness→desaturate,
   onset/kick→pop); onset SPARK PARTICLES (#15/#18); new SPECTRUM FAN pattern (#19/#2/#7 — 24 bands as a
   live radial beam-fan w/ peak-hold). All Canvas2D, free. Remaining 50+ ideas ship across Waves 2-4. */
/* v34 FIX "only plays the atlas sample": while a chosen song is downloading, currentSrc is now 'loading'
   (was left as 'demo'), so tapping ▶ during the load no longer cancels it AND starts the demo synth.
   play() refuses to act on 'loading'; stop() clears it; the play button shows ⏳ while buffering, wired to
   the <audio> waiting/stalled/playing events. A failed load still ends at 'none' (never demo, never preview). */
/* v33 100% AUDIO-REACTIVE COLOUR SYNC: when MUSIC SYNC is on, the palette itself breathes with the song —
   saturation washes out in quiet passages and POPS vivid on every beat, lightness goes dark→bright with
   band-weighted loudness (+beat punch), and the hue leans warm on bass / cool on treble (the spectrum
   paints the colour). Verified live on real audio: sat 75→93 + light 47→58 pulsing on the kick, hue
   drifting warm on the bass-heavy demo. Anchored to the sat/light sliders as a baseline; manual when sync off. */
/* v32 COLOR ENGINE + BRIDGE RESILIENCE: full color range — Saturation + Lightness controls (was locked
   100%/62%), a Custom full-color-wheel palette (hue 0-360 + spread mono↔rainbow), 6 new presets, and the
   blended 2nd pattern now has its OWN palette + hue shift + color-mix mode (Overlay/Screen/Add) so the two
   patterns mix into NEW colors. Bridge: concurrency queue + per-id de-dupe, retry/back-off, request pacing,
   24h-gated yt-dlp nightly auto-update, rich /health self-test, structured degraded JSON, /resolve any link,
   multi-site /search?src=sc, /audio?url= for any site, progressive-http format (no ffmpeg), /proxy. */
/* v31 MUSIC CATALOG — FULL SONGS ONLY: removed Apple/Deezer 30s-preview engines + the previews
   toggle + the 30s-preview fallback (search now = YouTube-bridge + Audius + Internet Archive + Jamendo,
   every result is the complete track). YOUTUBE BRIDGE FIX: serve.js now passes --impersonate chrome
   (curl_cffi) → defeats YouTube's HTTP-403 bot block + Python-3.14 SSL handshake failure that made
   /search return []. Requires: pip install curl_cffi + yt-dlp nightly. */
/* v30 refinements (loop 5): Glow + Thickness sliders now reach EVERY pattern (gb()/tw() routed through
   all 14 direct-draw patterns, not just dot()/seg()/upBeam) · deeper adaptive quality — the FPS governor
   now thins pattern DENSITY (dQ) after dimming glow, recovering density-first · removed a duplicated
   Auto-VJ block that ran the drop detector twice per frame */
/* v29 refinements: reduced-motion now gates beat-LFO · help text refreshed (24 patterns + all features) · density on hexgrid + plasma */
/* v28: #1 QR phone-connect (tunnel URL → QR → phone opens the working app) · #3 adaptive-quality FPS governor + FPS readout */
/* v27: #2 STREAMED PLAYBACK — <audio> element through Web Audio: instant first-play, native
   draggable seek, low memory; falls back to fetch+decode buffer when a source has no CORS */
/* v26: density on 8 patterns (+kaleid/tunnel/vortex/radial) · beat-LFO wobble · picture-in-picture */
/* v25: #7 album-art-driven palette · #9 per-pattern controls (per-mode Glow/Thickness/Density) */
/* v24: playback-speed · slider value readouts · surprise-show · tap-tempo (crossfade already shipped) */
/* v23: gesture nav (swipe = change pattern, double-tap = play/pause) · reset-all-settings button */
/* v22: Media Session (lock-screen/Bluetooth/car transport + metadata + position) · Auto-VJ
   drop-synced pattern switching · adjustable pyramid spin-speed */
/* v21: bridge health indicator (/health) · no silent-demo-on-fail · adjustable transition time ·
   named preset profiles · update-available prompt + visible version. v20: crash-proof render loop ·
   pyramid sides+spin · auto-cycle interval · full-settings presets · full-track-first streaming · thumbnails */
/* relative paths so the app installs at ANY base path (localhost root AND github.io/atlas-prism subpath) */
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // never cache the YouTube bridge or cross-origin API/audio requests — network only
  if (url.origin !== self.location.origin ||
      url.pathname.startsWith('/search') || url.pathname.startsWith('/audio')) return;
  event.respondWith(
    caches.match(event.request).then((hit) => {
      if (hit) return hit;
      return fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
