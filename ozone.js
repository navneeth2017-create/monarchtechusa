/* ==========================================================================
   OZONE — clickable product tour
   Vanilla JS. No framework, no build step.
   Voice: Kokoro-82M (Apache-2.0, hexgrad) running locally in a Web Worker,
   with the browser speech engine as an automatic fallback.
   ========================================================================== */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------- */
  /*  Data — fictional ozone accounts                                        */
  /* ---------------------------------------------------------------------- */

  const STORES = [
    { id: "sunset", name: "Sunset Suites", kind: "Hotel", dist: 2.4, machines: 6, fit: 98, phone: "(480) 555-0142", contact: "Maria Cordova", first: "Maria", x: 46, y: 56, hot: true },
    { id: "northside", name: "Northside Grill", kind: "Restaurant", dist: 3.1, machines: 2, fit: 94, phone: "(480) 555-0177", contact: "Dave Whitaker", first: "Dave", x: 32, y: 38 },
    { id: "ironwood", name: "Ironwood Fitness", kind: "Gym", dist: 4.0, machines: 3, fit: 91, phone: "(480) 555-0119", contact: "Tasha Bell", first: "Tasha", x: 61, y: 34 },
    { id: "palmcourt", name: "Palm Court Offices", kind: "Property mgmt", dist: 5.2, machines: 4, fit: 88, phone: "(480) 555-0163", contact: "Ruben Ortiz", first: "Ruben", x: 70, y: 63 },
    { id: "cleanslate", name: "Clean Slate Laundry", kind: "Laundromat", dist: 6.1, machines: 8, fit: 86, phone: "(480) 555-0128", contact: "Nadia Park", first: "Nadia", x: 24, y: 70 },
    { id: "copper", name: "Copper Kettle Brewing", kind: "Brewery", dist: 7.3, machines: 2, fit: 82, phone: "(480) 555-0155", contact: "Sean Doyle", first: "Sean", x: 55, y: 20 },
    { id: "mesa", name: "Mesa Sports Club", kind: "Gym", dist: 8.0, machines: 5, fit: 79, phone: "(480) 555-0184", contact: "Priya Nair", first: "Priya", x: 82, y: 28 },
    { id: "lakeview", name: "Lakeview Dental", kind: "Dental", dist: 9.4, machines: 1, fit: 74, phone: "(480) 555-0196", contact: "Dr. Ellis", first: "Ellis", x: 14, y: 22 },
  ];

  const SEQ = {
    sms0: {
      kind: "SMS", when: "Day 0 · sent 4:12 PM", state: "Delivered",
      body: "Hi Dave — Ava from Oxypure Solutions. Marcus finished the cell swap at Northside Grill about 20 minutes ago. Everything is reading clean on our side. If anything smells off in the next few days, just reply here and I'll get someone out.",
      html: (t) => `<div class="oz-msg">${t}</div>`,
    },
    email2: {
      kind: "Email", when: "Day 2 · 8:00 AM", state: "Draft ready",
      subject: "Your service report — Northside Grill",
      body: `Hi Dave,

Here is the short version of Thursday's visit:

• Unit 2 — ozone cell replaced (was at 9,140 of 9,000 rated hours)
• Unit 1 — output tested at 96%, no action needed
• Both units back on the normal schedule

One thing worth planning: Unit 1 hits its service window in about seven weeks, right before your summer volume. Want me to hold a date now so it doesn't land in the middle of a rush?

— Ava, Oxypure Solutions`,
      html: (t, subject) => `<div class="oz-mail"><span class="oz-mail-sub">Subject · ${subject}</span>${t.replace(/\n/g, "<br>")}</div>`,
    },
    sms4: {
      kind: "SMS", when: "Day 4 · 10:00 AM", state: "Queued",
      body: "Dave — quick heads up. Unit 1 at Northside Grill is at 8,420 hours. You've got roughly seven weeks before it's due. Want me to pencil in the week of the 14th before the rush?",
      html: (t) => `<div class="oz-msg">${t}</div>`,
    },
    call7: {
      kind: "AI call", when: "Day 7 · 11:00 AM", state: "Conditional",
      body: "Only runs if nobody replied to the text or email. The assistant calls Dave, references the service report, offers two windows, and books the one he picks — same as the call module.",
      html: (t) => `<div class="oz-msg">${t}</div>`,
    },
  };

  const STOPS_INITIAL = [
    { id: "sunset", name: "Sunset Suites", task: "Cell replacement · unit 3", kind: "repair", tech: "Marcus", x: 46, y: 56 },
    { id: "northside", name: "Northside Grill", task: "Filter service", kind: "repair", tech: "Marcus", x: 32, y: 38 },
    { id: "cleanslate", name: "Clean Slate Laundry", task: "Deliver 4 × OZ-500", kind: "delivery", tech: "Dee", x: 24, y: 70 },
    { id: "ironwood", name: "Ironwood Fitness", task: "UV check + quote", kind: "repair", tech: "Marcus", x: 61, y: 34 },
    { id: "palmcourt", name: "Palm Court Offices", task: "Deliver 6 × OZ-200", kind: "delivery", tech: "Dee", x: 70, y: 63 },
    { id: "copper", name: "Copper Kettle Brewing", task: "Ozone sensor swap", kind: "repair", tech: "Marcus", x: 55, y: 20 },
    { id: "mesa", name: "Mesa Sports Club", task: "Deliver 2 × OZ-500", kind: "delivery", tech: "Dee", x: 82, y: 28 },
    { id: "lakeview", name: "Lakeview Dental", task: "Annual service", kind: "repair", tech: "Marcus", x: 14, y: 22 },
  ];

  const OPTIMISED_ORDER = ["lakeview", "copper", "northside", "ironwood", "mesa", "palmcourt", "sunset", "cleanslate"];

  const TASKS = [
    { title: "Cell replacement · unit 3", store: "Sunset Suites", tech: "Marcus Reed", meta: "Repair · skill match · 9:00–11:00 booked by Ava" },
    { title: "Deliver 4 × OZ-500", store: "Clean Slate Laundry", tech: "Dee Alvarez", meta: "Delivery · parts on van 2 · before 2:00 PM" },
    { title: "Filter service + UV check", store: "Ironwood Fitness", tech: "Marcus Reed", meta: "Repair · 12 minutes from previous stop" },
    { title: "Deliver 2 × OZ-200", store: "Lakeview Dental", tech: "Dee Alvarez", meta: "Delivery · fits the morning loop · by 4:00 PM" },
  ];

  /* ---------------------------------------------------------------------- */
  /*  Voice — Kokoro on the main thread, phone-filtered, with system fallback */
  /* ---------------------------------------------------------------------- */

  const Voice = (() => {
    const CDN = "https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm";
    const MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";
    let tts = null;
    let status = "idle"; // idle | loading | ready | failed
    let progress = 0;
    let device = null;
    let dtype = null;
    const cache = new Map();
    const preCache = new Map(); // pre-rendered call audio: index -> ArrayBuffer
    let ctx = null;
    let chain = null;
    let activeSource = null;
    let muted = false;
    let slow = false;
    let warm = null;

    function buildChain() {
      if (ctx) return ctx;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      ctx = new Ctx();
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 280;
      hp.Q.value = 0.7;

      const presence = ctx.createBiquadFilter();
      presence.type = "peaking";
      presence.frequency.value = 1900;
      presence.Q.value = 1.1;
      presence.gain.value = 2.5;

      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 3600;
      lp.Q.value = 0.7;

      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20;
      comp.knee.value = 14;
      comp.ratio.value = 3;
      comp.attack.value = 0.004;
      comp.release.value = 0.25;

      const out = ctx.createGain();
      out.gain.value = 0.95;

      hp.connect(presence).connect(lp).connect(comp).connect(out).connect(ctx.destination);
      chain = hp;
      return ctx;
    }

    function estimate(text) {
      const words = text.trim().split(/\s+/).length;
      return Math.max(900, (words / 2.6) * 1000);
    }

    function systemSpeak(text, role) {
      return new Promise((resolve) => {
        if (!("speechSynthesis" in window) || muted) {
          setTimeout(resolve, estimate(text));
          return;
        }
        const u = new SpeechSynthesisUtterance(text);
        u.rate = role === "owner" ? 0.98 : 1.03;
        u.pitch = role === "owner" ? 0.78 : 1.02;
        u.volume = 1;
        const voices = window.speechSynthesis.getVoices();
        const female = voices.find(
          (v) => /en[-_]US/i.test(v.lang) && /(zira|aria|jenny|samantha|susan|zoe|hazel|libby|sonia|karen|moira|tessa|veena|victoria|female|woman|natural|Google US English)/i.test(v.name)
        );
        const anyUS = voices.find((v) => /en[-_]US/i.test(v.lang));
        const anyEnglish = voices.find((v) => /^en/i.test(v.lang));
        if (female || anyUS || anyEnglish) u.voice = female || anyUS || anyEnglish;
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          resolve();
        };
        u.onend = done;
        u.onerror = done;
        // Safety net: some engines never fire onend.
        setTimeout(done, estimate(text) + 6000);
        try {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        } catch {
          done();
        }
      });
    }

    function playBuffer(buffer) {
      if (muted) return Promise.resolve(estimate("x"));
      const context = buildChain();
      if (!context) return Promise.resolve();
      return context.decodeAudioData(buffer.slice(0)).then(
        (decoded) =>
          new Promise((resolve) => {
            const src = context.createBufferSource();
            src.buffer = decoded;
            src.connect(chain);
            activeSource = src;
            src.onended = () => {
              if (activeSource === src) activeSource = null;
              resolve();
            };
            src.start();
          })
      );
    }

    function request(text, voice) {
      const key = voice + "|" + text;
      if (cache.has(key)) return Promise.resolve(cache.get(key));
      return tts.generate(text, { voice }).then(async (audio) => {
        const buffer = await audio.toBlob().arrayBuffer();
        cache.set(key, buffer);
        return buffer;
      });
    }

    let prefetchToken = 0;

    // Pre-rendered Kokoro audio shipped alongside the page: instant, always
    // high quality, no model download. Works on any hosted (http/https) link.
    async function preloadCall() {
      if (location.protocol === "file:") return;
      const idxs = [0, 1, 2, 3, 4, 5, 6, 7];
      await Promise.allSettled(
        idxs.map(async (i) => {
          try {
            const r = await fetch(`assets/audio/call-${i}.wav`);
            if (!r.ok) throw new Error("missing");
            preCache.set(i, await r.arrayBuffer());
          } catch {
            /* unavailable — fall back to live voice */
          }
        })
      );
    }
    function hasCallAudio(i) {
      return preCache.has(i);
    }
    async function playCallAudio(i, fallbackMs) {
      if (muted) {
        await wait(fallbackMs || 2400);
        return;
      }
      const buf = preCache.get(i);
      if (!buf) return;
      await playBuffer(buf);
    }

    async function prefetch(items) {
      if (status !== "ready" || muted) return;
      const token = ++prefetchToken;
      for (const item of items) {
        if (token !== prefetchToken) return;
        const voice = item.role === "owner" ? "am_michael" : "af_heart";
        const key = voice + "|" + item.text;
        if (cache.has(key)) continue;
        try {
          await request(item.text, voice);
        } catch {
          return;
        }
        await wait(120); // yield so the UI stays smooth between generations
      }
    }

    async function init() {
      if (status !== "idle") return;
      if (location.protocol === "file:") {
        status = "failed";
        return;
      }
      status = "loading";
      try {
        const mod = await import(CDN);
        device = navigator.gpu ? "webgpu" : "wasm";
        dtype = navigator.gpu ? "fp32" : "q8";
        tts = await mod.KokoroTTS.from_pretrained(MODEL, {
          dtype,
          device,
          progress_callback: (p) => {
            if (!p) return;
            if (p.status === "progress" && typeof p.progress === "number") {
              progress = Math.max(progress, Math.min(100, p.progress));
              document.dispatchEvent(new CustomEvent("oz:voice-progress", { detail: { progress } }));
            }
          },
        });
        status = "ready";
        warm = (async () => {
          try {
            await request("One.", "af_heart"); // first inference is always slow — warm the pipe
            const t0 = performance.now();
            await request("Checking the line.", "af_heart");
            slow = performance.now() - t0 > 4200;
          } catch {
            slow = true;
          }
          document.dispatchEvent(new CustomEvent("oz:voice-ready", { detail: { device, slow } }));
        })();
      } catch {
        status = "failed";
        document.dispatchEvent(new CustomEvent("oz:voice-failed"));
      }
    }

    async function speak(text, role) {
      const voice = role === "owner" ? "am_michael" : "af_heart";
      if (muted) {
        await wait(estimate(text));
        return;
      }
      if (status === "ready" && warm) {
        try {
          await Promise.race([warm, wait(1500)]);
          if (!slow) {
            const buffer = await request(text, voice);
            if (muted) {
              await wait(estimate(text));
              return;
            }
            await playBuffer(buffer);
            return;
          }
        } catch {
          /* fall through to the system voice */
        }
      }
      await systemSpeak(text, role);
    }

    function cancel() {
      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* ignore */
        }
      }
      if (activeSource) {
        try {
          activeSource.stop();
        } catch {
          /* ignore */
        }
        activeSource = null;
      }
    }

    function setMuted(next) {
      muted = next;
      if (muted) cancel();
    }

    return {
      init,
      speak,
      prefetch,
      preloadCall,
      hasCallAudio,
      playCallAudio,
      cancel,
      setMuted,
      get status() { return status; },
      get progress() { return progress; },
      get device() { return device; },
      get slow() { return slow; },
      get muted() { return muted; },
    };
  })();

  /* ---------------------------------------------------------------------- */
  /*  Shell                                                                  */
  /* ---------------------------------------------------------------------- */

  const URLS = {
    find: "app.monarch / oxypure-solutions",
    call: "app.monarch / oxypure-solutions/calling",
    follow: "app.monarch / oxypure-solutions/sequences",
    inbox: "app.monarch / oxypure-solutions/inbox",
    dispatch: "app.monarch / oxypure-solutions/dispatch",
  };

  let activePanel = "find";
  let callToken = 0;
  let callTimer = null;
  let callSeconds = 0;

  function showPanel(name) {
    if (!URLS[name]) return;
    activePanel = name;
    $$(".oz-panel").forEach((p) => {
      const on = p.dataset.panel === name;
      p.hidden = !on;
      p.classList.toggle("is-active", on);
    });
    $$("[data-mod]").forEach((b) => b.classList.toggle("is-active", b.dataset.mod === name));
    const url = $("[data-oz-url]");
    if (url) url.textContent = URLS[name];
    Voice.cancel();
    if (name !== "call") stopCallClock();
  }

  function toast(panel, message) {
    const el = $(`[data-panel="${panel}"] [data-toast]`);
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
      el.hidden = true;
    }, 5200);
  }

  /* ---------------------------------------------------------------------- */
  /*  Find                                                                   */
  /* ---------------------------------------------------------------------- */

  let selectedStore = STORES[0];
  const pinsBox = $("[data-pins]");
  const listBox = $("[data-store-list]");

  function initials(name) {
    return name
      .split(/\s+/)
      .filter((w) => /[A-Za-z]/.test(w[0]))
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  }

  function renderStores() {
    if (!pinsBox || !listBox) return;
    pinsBox.innerHTML = "";
    listBox.innerHTML = "";

    STORES.forEach((store, i) => {
      const pin = document.createElement("button");
      pin.type = "button";
      pin.className = "oz-pin" + (store.hot ? " is-hot" : "");
      pin.style.left = store.x + "%";
      pin.style.top = store.y + "%";
      pin.style.animationDelay = i * 40 + "ms";
      pin.textContent = String(i + 1);
      pin.title = store.name;
      pin.setAttribute("aria-label", store.name);
      pin.addEventListener("click", () => selectStore(store.id, true));
      pinsBox.appendChild(pin);

      const row = document.createElement("button");
      row.type = "button";
      row.className = "oz-store";
      row.dataset.store = store.id;
      row.innerHTML = `
        <span class="oz-avatar">${initials(store.name)}</span>
        <span class="oz-store-name">
          <b>${store.name}</b>
          <span>${store.kind} · ${store.machines} machine${store.machines === 1 ? "" : "s"} · ${store.dist} mi</span>
        </span>
        <span class="oz-fit">${store.fit}</span>`;
      row.addEventListener("click", () => selectStore(store.id, false));
      listBox.appendChild(row);
    });
  }

  function selectStore(id, fromPin) {
    const store = STORES.find((s) => s.id === id);
    if (!store) return;
    selectedStore = store;
    $$(".oz-store").forEach((r) => r.classList.toggle("is-active", r.dataset.store === id));
    $$(".oz-pin").forEach((p, i) => p.classList.toggle("is-active", STORES[i].id === id));
    if (fromPin) {
      const row = $(`.oz-store[data-store="${id}"]`);
      if (row) row.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
    }
    const badge = $("[data-fit-badge]");
    if (badge) badge.textContent = `${store.fit} fit · ${store.machines} machines`;
    warmCallScript();
  }

  // Render the whole call in the background so the demo plays without gaps.
  function warmCallScript() {
    if (Voice.status !== "ready" || Voice.slow) return;
    const lines = callScript(selectedStore).map((line) => ({
      text: line.text,
      role: line.who === "ai" ? "ai" : "owner",
    }));
    setTimeout(() => Voice.prefetch(lines), 60);
  }

  const callRound = $("[data-call-round]");
  if (callRound) {
    callRound.addEventListener("click", async () => {
      callRound.disabled = true;
      toast("find", `Dialling ${selectedStore.name} first — 7 more accounts queued behind it.`);
      await wait(900);
      prepareCall(selectedStore);
      showPanel("call");
      callRound.disabled = false;
      $("#tour")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  }

  /* ---------------------------------------------------------------------- */
  /*  Call                                                                   */
  /* ---------------------------------------------------------------------- */

  function callScript(store) {
    return [
      { who: "ai", text: `Hi, this is Ava from Oxypure Solutions. Am I catching you at a bad time?` },
      { who: "owner", text: `No, you're fine. What's this about?` },
      { who: "ai", text: `I'm looking at ${store.machines} machines at ${store.name}. Two are due for a cell replacement, and I can get a tech out this week.` },
      { who: "owner", text: `This week is tight. What have you got open?` },
      { who: "ai", text: `Thursday afternoon, or Friday between nine and eleven. Marcus would be the tech.` },
      { who: "owner", text: `Friday morning works.` },
      { who: "ai", text: `Booked for Friday, nine to eleven. I'll text you the confirmation and Marcus will call when he's thirty minutes out.` },
      { who: "owner", text: `Perfect, thanks.` },
    ];
  }

  const callTitle = $("[data-call-title]");
  const callName = $("[data-call-name]");
  const callSub = $("[data-call-sub]");
  const callState = $("[data-call-state]");
  const callTimerEl = $("[data-call-timer]");
  const callAvatar = $("[data-call-avatar]");
  const transcript = $("[data-transcript]");
  const outcome = $("[data-outcome]");
  const wave = $("[data-wave]");
  const startBtn = $("[data-call-start]");
  const skipBtn = $("[data-call-skip]");

  function prepareCall(store) {
    if (!store) return;
    callToken++;
    Voice.cancel();
    stopCallClock();
    callSeconds = 0;
    if (callTimerEl) callTimerEl.textContent = "0:00";
    if (callTitle) callTitle.textContent = store.name;
    if (callName) callName.textContent = store.name;
    if (callSub) callSub.textContent = `${store.kind} · ${store.machines} machine${store.machines === 1 ? "" : "s"} on site · ${store.phone}`;
    if (callAvatar) callAvatar.textContent = initials(store.name);
    if (callState) {
      callState.textContent = "Ready";
      callState.className = "oz-badge";
    }
    if (transcript) transcript.innerHTML = "";
    if (outcome) outcome.hidden = true;
    if (wave) wave.classList.remove("is-live");
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.innerHTML = `<svg viewBox="0 0 20 20" aria-hidden="true"><use href="#i-phone"/></svg> Start the call`;
    }
    if (skipBtn) skipBtn.disabled = false;
  }

  function startCallClock() {
    stopCallClock();
    callSeconds = 0;
    callTimer = setInterval(() => {
      callSeconds++;
      if (callTimerEl) {
        callTimerEl.textContent = Math.floor(callSeconds / 60) + ":" + String(callSeconds % 60).padStart(2, "0");
      }
    }, 1000);
  }

  function stopCallClock() {
    if (callTimer) clearInterval(callTimer);
    callTimer = null;
  }

  function addLine(who, text) {
    if (!transcript) return null;
    const line = document.createElement("div");
    line.className = "oz-line is-" + who;
    line.innerHTML = `<span class="oz-who">${who === "ai" ? "Ava" : "Owner"}</span><span class="oz-said"></span>`;
    const said = $(".oz-said", line);
    transcript.appendChild(line);
    transcript.scrollTop = transcript.scrollHeight;
    // Type the line in quickly — feels like live transcription.
    let i = 0;
    const step = Math.max(1, Math.round(text.length / 46));
    const tick = () => {
      i = Math.min(text.length, i + step);
      said.textContent = text.slice(0, i);
      transcript.scrollTop = transcript.scrollHeight;
      if (i < text.length) setTimeout(tick, 18);
    };
    tick();
    return line;
  }

  async function runCall() {
    const token = ++callToken;
    const store = selectedStore;
    const lines = callScript(store);
    if (startBtn) startBtn.disabled = true;
    if (skipBtn) skipBtn.disabled = false;
    if (outcome) outcome.hidden = true;
    if (callState) {
      callState.textContent = "Dialling";
      callState.className = "oz-badge is-busy";
    }

    await wait(650);
    if (token !== callToken) return;

    if (callState) {
      callState.textContent = "Live";
      callState.className = "oz-badge is-live";
    }
    if (wave) wave.classList.add("is-live");
    startCallClock();

    const usePrerendered = store.id === "sunset";
    for (let i = 0; i < lines.length; i++) {
      if (token !== callToken) return;
      const line = lines[i];
      const el = addLine(line.who, line.text);
      if (el) el.classList.add("is-speaker");
      const estMs = Math.max(1500, line.text.split(/\s+/).length * 360);
      if (usePrerendered && Voice.hasCallAudio(i)) {
        await Voice.playCallAudio(i, estMs);
      } else {
        await Voice.speak(line.text, line.who === "ai" ? "ai" : "owner");
      }
      if (token !== callToken) return;
      if (el) el.classList.remove("is-speaker");
      await wait(320);
    }

    if (token !== callToken) return;
    finishCall();
  }

  function finishCall() {
    stopCallClock();
    if (wave) wave.classList.remove("is-live");
    if (callState) {
      callState.textContent = "Complete";
      callState.className = "oz-badge is-live";
    }
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.innerHTML = `<svg viewBox="0 0 20 20" aria-hidden="true"><use href="#i-phone"/></svg> Call again`;
    }
    if (skipBtn) skipBtn.disabled = true;
    if (outcome) outcome.hidden = false;

    const grid = $(".oz-outcome-grid", outcome || document);
    if (grid) {
      const slot = grid.children[0];
      if (slot) slot.innerHTML = `<span>Window</span><b>Friday, 9:00–11:00</b>`;
    }
    toast("call", "Booked, logged, and added to the follow-up sequence.");
  }

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      Voice.init();
      prepareCall(selectedStore);
      runCall();
    });
  }
  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      callToken++;
      Voice.cancel();
      const lines = callScript(selectedStore);
      if (transcript) {
        transcript.innerHTML = "";
        lines.forEach((l) => {
          const line = document.createElement("div");
          line.className = "oz-line is-" + l.who;
          line.innerHTML = `<span class="oz-who">${l.who === "ai" ? "Ava" : "Owner"}</span><span class="oz-said">${l.text}</span>`;
          transcript.appendChild(line);
        });
        transcript.scrollTop = transcript.scrollHeight;
      }
      finishCall();
    });
  }

  /* ---------------------------------------------------------------------- */
  /*  Follow-up                                                              */
  /* ---------------------------------------------------------------------- */

  let activeStep = "email2";

  function renderStep(key) {
    const step = SEQ[key];
    const box = $("[data-preview]");
    if (!step || !box) return;
    activeStep = key;
    $$(".oz-seq-step").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.step === key);
      b.classList.toggle("is-done", b.dataset.step === "sms0" && key !== "sms0");
    });
    const kind = $("[data-preview-kind]", box);
    const when = $("[data-preview-when]", box);
    const body = $("[data-preview-body]", box);
    const send = $("[data-preview-send]", box);
    if (kind) kind.textContent = step.kind;
    if (when) when.textContent = step.when;
    if (body) body.innerHTML = step.html(step.body, step.subject);
    if (send) {
      send.textContent = key === "call7" ? "Queue the call" : key === "sms0" ? "Already delivered" : "Approve & send";
      send.disabled = key === "sms0";
    }
    const badge = $('[data-panel="follow"] .oz-badge');
    if (badge) {
      const idx = Object.keys(SEQ).indexOf(key) + 1;
      badge.textContent = `Step ${idx} of 4`;
    }
  }

  $$(".oz-seq-step").forEach((btn) => btn.addEventListener("click", () => renderStep(btn.dataset.step)));

  const previewSend = $("[data-preview-send]");
  if (previewSend) {
    previewSend.addEventListener("click", async () => {
      if (activeStep === "sms0") return;
      const label = activeStep === "call7" ? "Call queued for Day 7 — it will only fire if nobody replies." : "Approved and sent in the sample sequence.";
      toast("follow", label);
      previewSend.disabled = true;
      previewSend.textContent = activeStep === "call7" ? "Queued" : "Sent";
      await wait(600);
    });
  }

  const previewEdit = $("[data-preview-edit]");
  if (previewEdit) {
    previewEdit.addEventListener("click", async () => {
      const body = $("[data-preview-body]");
      if (!body) return;
      previewEdit.disabled = true;
      previewEdit.textContent = "Writing…";
      body.style.opacity = "0.4";
      await wait(900);
      body.style.opacity = "1";
      previewEdit.disabled = false;
      previewEdit.textContent = "Regenerate draft";
      toast("follow", "New draft written from the service record and the last two replies.");
    });
  }

  /* ---------------------------------------------------------------------- */
  /*  Inbox                                                                  */
  /* ---------------------------------------------------------------------- */

  const chatBox = $("[data-chat]");
  const quickBox = $("[data-quick]");

  const CHAT_START = [
    { from: "customer", text: "hey — the machine at the front desk smells weird and there's a red light blinking" },
    { from: "ai", text: "Hi Maria, it's Oxypure. That's the cell-due indicator, nothing dangerous. Is the red light solid, or blinking twice with a pause?" },
  ];

  const BRANCHES = {
    blink: {
      label: "It's blinking twice",
      say: "it blinks twice then pauses",
      ai: [
        "Blinking twice means the ozone cell has passed its rated hours. It'll still run, but it won't hit full output — I'd stop running it overnight until it's swapped.",
        "I can put Marcus down for Friday 9–11, or send a replacement cell you can swap yourself in about ten minutes.",
      ],
      next: ["tech", "cost"],
    },
    tech: {
      label: "Send a tech",
      say: "send the tech please",
      ai: [
        "Done — Friday, 9:00 to 11:00 with Marcus. He'll bring both a cell and a spare sensor.",
        "You'll get a text when he's thirty minutes out. I've put the work order on Sunset Suites so it shows on your account.",
      ],
      next: ["thanks", "reschedule"],
      effect: "tech",
    },
    cost: {
      label: "What's a cell cost?",
      say: "what does the cell run?",
      ai: [
        "The OZ-500 cell is $184 fitted, or $139 if you swap it yourself. Friday's visit would include it, so there's no separate trip charge.",
      ],
      next: ["tech", "self"],
    },
    self: {
      label: "I'll swap it myself",
      say: "i'll do it myself",
      ai: [
        "No problem. I'll ship a cell today — two days to your front desk, and the swap guide comes in the box. Send me a photo of the serial plate and I'll confirm the right part before it goes out.",
      ],
      next: ["thanks"],
    },
    reschedule: {
      label: "Friday doesn't work",
      say: "friday's no good, can we do monday",
      ai: [
        "Monday works. I've got Marcus 9–11 or 1–3. Which side of the day is easier for the front desk?",
      ],
      next: ["mondayam", "mondaypm"],
    },
    mondayam: { label: "Monday 9–11", say: "monday morning", ai: ["Booked — Monday 9:00 to 11:00. Confirmation is on its way."], next: ["thanks"] },
    mondaypm: { label: "Monday 1–3", say: "monday afternoon", ai: ["Booked — Monday 1:00 to 3:00. Confirmation is on its way."], next: ["thanks"] },
    thanks: { label: "Thank you", say: "perfect thank you", ai: ["Anytime. I'll leave the thread open — reply here if anything changes before Friday."], next: [] },
  };

  function bubble(from, text) {
    const el = document.createElement("div");
    el.className = "oz-bubble is-" + from;
    el.textContent = text;
    if (chatBox) {
      chatBox.appendChild(el);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
    return el;
  }

  function typing() {
    const el = document.createElement("div");
    el.className = "oz-bubble is-ai is-typing";
    el.innerHTML = "<i></i><i></i><i></i>";
    if (chatBox) {
      chatBox.appendChild(el);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
    return el;
  }

  function renderQuick(keys) {
    if (!quickBox) return;
    quickBox.innerHTML = "";
    (keys || []).forEach((key) => {
      const b = BRANCHES[key];
      if (!b) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "oz-quick";
      btn.textContent = b.label;
      btn.addEventListener("click", () => runBranch(key));
      quickBox.appendChild(btn);
    });
  }

  async function runBranch(key) {
    const branch = BRANCHES[key];
    if (!branch) return;
    if (quickBox) $$(".oz-quick", quickBox).forEach((b) => (b.disabled = true));
    bubble("customer", branch.say);
    await wait(520);
    for (const text of branch.ai) {
      const t = typing();
      await wait(700 + Math.min(1200, text.length * 5));
      t.remove();
      bubble("ai", text);
      await wait(280);
    }
    if (branch.effect === "tech") {
      const badge = $('.oz-chat-live');
      if (badge) badge.innerHTML = "<i></i> Booked";
      toast("inbox", "Work order created for Friday 9–11 and assigned to Marcus.");
    }
    renderQuick(branch.next);
  }

  function initChat() {
    if (!chatBox) return;
    chatBox.innerHTML = "";
    CHAT_START.forEach((m) => bubble(m.from, m.text));
    renderQuick(["blink"]);
  }

  /* ---------------------------------------------------------------------- */
  /*  Dispatch                                                               */
  /* ---------------------------------------------------------------------- */

  let stops = STOPS_INITIAL.map((s) => ({ ...s }));
  const stopsBox = $("[data-stops]");
  const routeLine = $("[data-route-line]");
  const routeDots = $("[data-route-dots]");
  const routeStats = $("[data-route-stats]");
  const feed = $("[data-feed]");
  let optimised = false;

  function toPoint(stop) {
    return [Math.round((stop.x / 100) * 520), Math.round((stop.y / 100) * 240)];
  }

  function drawRoute() {
    if (!routeLine || !routeDots) return;
    const pts = stops.map(toPoint);
    routeLine.setAttribute("points", pts.map((p) => p.join(",")).join(" "));
    routeDots.innerHTML = "";
    pts.forEach((p, i) => {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", p[0]);
      c.setAttribute("cy", p[1]);
      c.setAttribute("r", i === 0 ? "5.5" : "4");
      c.setAttribute("fill", i === 0 ? "#0a7cff" : "rgba(10,124,255,.55)");
      c.setAttribute("stroke", "#ffffff");
      c.setAttribute("stroke-width", "1.5");
      c.setAttribute("class", "oz-route-dot");
      routeDots.appendChild(c);
    });
  }

  function renderStops(animate) {
    if (!stopsBox) return;
    stopsBox.innerHTML = "";
    stops.forEach((stop, i) => {
      const row = document.createElement("div");
      row.className = "oz-stop is-" + stop.kind + (animate ? " is-moved" : "");
      row.innerHTML = `
        <span class="oz-stop-num">${i + 1}</span>
        <span class="oz-stop-name"><b>${stop.name}</b><span>${stop.task} · ${stop.tech}</span></span>
        <span class="oz-stop-tag">${stop.kind === "repair" ? "Repair" : "Delivery"}</span>`;
      stopsBox.appendChild(row);
    });
    const count = $("[data-stop-count]");
    if (count) count.textContent = String(stops.length);
    drawRoute();
  }

  const optimizeBtn = $("[data-optimize]");
  if (optimizeBtn) {
    optimizeBtn.addEventListener("click", async () => {
      optimizeBtn.disabled = true;
      optimizeBtn.textContent = "Optimising…";
      await wait(700);
      const byId = new Map(stops.map((s) => [s.id, s]));
      stops = (optimised ? STOPS_INITIAL.map((s) => ({ ...s })) : OPTIMISED_ORDER.map((id) => byId.get(id)).filter(Boolean));
      optimised = !optimised;
      renderStops(true);
      if (routeStats) routeStats.textContent = optimised ? "28.6 mi · 4h 52m" : "41.2 mi · 6h 10m";
      optimizeBtn.disabled = false;
      optimizeBtn.textContent = optimised ? "Reset route" : "Optimise route";
      toast("dispatch", optimised ? "Re-sequenced: 12.6 miles and 78 minutes saved. Promise windows still hold." : "Back to the original stop order.");
    });
  }

  const assignBtn = $("[data-assign]");
  if (assignBtn) {
    assignBtn.addEventListener("click", async () => {
      if (!feed) return;
      assignBtn.disabled = true;
      feed.innerHTML = "";
      for (const task of TASKS) {
        await wait(620);
        const el = document.createElement("div");
        el.className = "oz-task";
        el.innerHTML = `<b>${task.title}</b><span>${task.store} · ${task.tech}</span><em>${task.meta}</em>`;
        feed.appendChild(el);
        feed.scrollTop = feed.scrollHeight;
      }
      const marcus = $("[data-load-marcus]");
      const dee = $("[data-load-dee]");
      if (marcus) marcus.textContent = "6 stops";
      if (dee) dee.textContent = "4 stops";
      assignBtn.disabled = false;
      assignBtn.innerHTML = `Re-run assignment <svg viewBox="0 0 20 20" aria-hidden="true"><use href="#i-arrow"/></svg>`;
      toast("dispatch", "Day split by skill, parts on hand, and the windows promised on the phone.");
    });
  }

  /* ---------------------------------------------------------------------- */
  /*  Wire-up                                                                */
  /* ---------------------------------------------------------------------- */

  $$("[data-mod]").forEach((btn) => btn.addEventListener("click", () => showPanel(btn.dataset.mod)));

  const sound = $("[data-sound]");
  if (sound) {
    sound.addEventListener("click", () => {
      const next = !Voice.muted;
      Voice.setMuted(next);
      sound.classList.toggle("is-on", !next);
      sound.setAttribute("aria-pressed", String(!next));
      const label = $("[data-sound-label]", sound);
      if (label) label.textContent = next ? "Voice off" : "Voice on";
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") Voice.cancel();
  });

  // Voice status chip
  const liveChip = $(".oz-live");
  document.addEventListener("oz:voice-progress", (event) => {
    if (!liveChip) return;
    liveChip.innerHTML = `<i></i> Loading voice · ${Math.round(event.detail.progress)}%`;
  });
  document.addEventListener("oz:voice-ready", (event) => {
    if (liveChip) {
      const slow = event.detail.slow;
      liveChip.innerHTML = `<i></i> ${slow ? "Sample workspace · system voice" : "Sample workspace · local AI voice"}`;
    }
    warmCallScript();
  });
  document.addEventListener("oz:voice-failed", () => {
    if (!liveChip) return;
    liveChip.innerHTML = `<i></i> System voice`;
  });

  function boot() {
    window.__ozVoice = Voice;
    Voice.preloadCall();
    renderStores();
    selectStore(STORES[0].id, false);
    prepareCall(STORES[0]);
    renderStep("email2");
    initChat();
    renderStops(false);
    if (routeStats) routeStats.textContent = "41.2 mi · 6h 10m";

    // Warm the voice in the background so the call plays instantly.
    const arm = () => Voice.init();
    if ("requestIdleCallback" in window) requestIdleCallback(arm, { timeout: 1800 });
    else setTimeout(arm, 900);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
