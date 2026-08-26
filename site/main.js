(function () {
  "use strict";

  const q = (s) => document.querySelector(s);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- mouse-reactive wave field on hero canvas ----
  const cv = q("#wv-wave");
  if (cv && !reduceMotion) {
    const ctx = cv.getContext("2d");
    const host = cv.parentElement;
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    const resize = () => {
      const r = host.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    host.addEventListener("mousemove", (e) => {
      const r = host.getBoundingClientRect();
      mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top;
    });
    host.addEventListener("mouseleave", () => { mouse.tx = -9999; mouse.ty = -9999; });

    const lines = [
      { base: 0.6, amp: 34, freq: 0.0032, speed: 0.00042, op: 0.34 },
      { base: 0.66, amp: 26, freq: 0.0044, speed: -0.00055, op: 0.24 },
      { base: 0.72, amp: 20, freq: 0.0058, speed: 0.0007, op: 0.16 },
      { base: 0.78, amp: 14, freq: 0.007, speed: -0.00035, op: 0.1 }
    ];
    let t0 = performance.now();
    const draw = (now) => {
      t0 = now;
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      ctx.clearRect(0, 0, w, h);
      lines.forEach((ln) => {
        ctx.beginPath();
        const baseY = h * ln.base;
        for (let x = 0; x <= w; x += 8) {
          const wave = Math.sin(x * ln.freq + now * ln.speed) * ln.amp;
          const d = Math.hypot(x - mouse.x, baseY - mouse.y);
          const influence = Math.exp(-d / 220) * 46;
          const y = baseY + wave - influence;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(47,111,237," + ln.op + ")";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      });
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  // ---- reveal on enter ----
  const els = [...document.querySelectorAll("[data-reveal]")];
  const show = (el) => el.classList.add("wv-in");
  if (reduceMotion) {
    els.forEach(show);
  } else {
    els.forEach((el, i) => { el.style.transitionDelay = (i % 4) * 60 + "ms"; });
    const sweep = () => {
      const vh = window.innerHeight || 800;
      els.forEach((el) => {
        if (el.classList.contains("wv-in")) return;
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > -80) show(el);
      });
    };
    setTimeout(sweep, 60);
    setTimeout(() => els.forEach(show), 1200); // failsafe: never permanently invisible if observers misfire
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    window._wvSweep = sweep;
  }

  // ---- counters ----
  const counted = new WeakSet();
  const cio = new IntersectionObserver((ents) => {
    ents.forEach((e) => {
      if (!e.isIntersecting || counted.has(e.target)) return;
      counted.add(e.target);
      const el = e.target;
      const end = parseFloat(el.dataset.count || "0");
      const pre = el.dataset.pre || "";
      const suf = el.dataset.suf === undefined ? "" : el.dataset.suf;
      if (reduceMotion) { el.textContent = pre + end + suf; return; }
      const t0 = performance.now();
      const tick = (t) => {
        const p = clamp((t - t0) / 1300, 0, 1);
        const e2 = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + Math.round(end * e2) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));

  // ---- scroll-spy nav ----
  const navLinks = [...document.querySelectorAll("[data-navlink]")];
  const navTargets = navLinks.map((a) => document.getElementById(a.dataset.navlink));
  let navActive = -1;

  // ---- timeline node activation ----
  const tlNodes = [...document.querySelectorAll("#wv-track [data-node]")].map((n) => n.firstElementChild).filter(Boolean);

  const toTop = q("#wv-top");
  const heroIn = q("#wv-heroin");
  const heroCv = q("#wv-wave");

  // ---- CCI formula scrubber (section 02) ----
  // Constants chosen to reproduce the paper's derivation: at tau = 0.3*Tc the
  // product crosses 0.60, the stated onset of ZF instability. NOTE: these are
  // prototype-convenience values (beta = 0.35, kappa(H) < 1), not the repo
  // defaults in src/cci.py (beta = 1.0, kappa(H) >= 1) — see the CCI direction
  // note in the site README / design handoff before treating this as ground truth.
  const FD = 30, TC = 0.014, BETA = 0.35, KAP = 0.95, SW = 0.83, TAUMAX = 0.012;
  const besselJ0 = (x) => {
    const t = Math.abs(x) / 3, t2 = t * t;
    return 1 - 2.2499997 * t2 + 1.2656208 * Math.pow(t2, 2) - 0.3163866 * Math.pow(t2, 3)
      + 0.0444479 * Math.pow(t2, 4) - 0.0039444 * Math.pow(t2, 5) + 0.00021 * Math.pow(t2, 6);
  };
  const cciTerms = (tau) => {
    const j = Math.abs(besselJ0(2 * Math.PI * FD * tau));
    const a = Math.exp(-BETA * tau / TC);
    return { k: KAP, j: j, s: SW, a: a, cci: KAP * j * SW * a };
  };
  const fx = (tau) => 70 + (tau / TAUMAX) * 700;
  const fy = (v) => 330 - clamp(v, 0, 1) * 290;

  const fPath = q("#wv-f-path"), fJPath = q("#wv-f-jpath");
  let lenF = 0, lenFJ = 0, tauCross = 0;
  const REDUCED_TAU = 0.005; // ~5ms, just past the crossing — held frame under prefers-reduced-motion
  if (fPath) {
    let d = "", dj = "";
    for (let i = 0; i <= 140; i++) {
      const tau = (i / 140) * TAUMAX, T = cciTerms(tau);
      d += (i ? "L" : "M") + fx(tau).toFixed(1) + "," + fy(T.cci).toFixed(1);
      dj += (i ? "L" : "M") + fx(tau).toFixed(1) + "," + fy(T.j).toFixed(1);
    }
    fPath.setAttribute("d", d);
    if (fJPath) fJPath.setAttribute("d", dj);
    lenF = fPath.getTotalLength();
    fPath.style.strokeDasharray = lenF;
    fPath.style.strokeDashoffset = reduceMotion ? 0 : lenF;
    if (fJPath) {
      lenFJ = fJPath.getTotalLength();
      fJPath.style.strokeDasharray = lenFJ;
      fJPath.style.strokeDashoffset = reduceMotion ? 0 : lenFJ;
    }
    for (let i = 0; i <= 400; i++) {
      const tau = (i / 400) * TAUMAX;
      if (cciTerms(tau).cci < 0.6) { tauCross = tau; break; }
    }
    const cd = q("#wv-f-crossdot"), ct = q("#wv-f-crosstx");
    if (cd) cd.setAttribute("cx", fx(tauCross).toFixed(1));
    if (ct) { ct.setAttribute("x", fx(tauCross).toFixed(1)); ct.textContent = "γ at τ ≈ " + (tauCross * 1000).toFixed(1) + " ms"; }
  }
  const fVerdicts = [
    "Fresh estimate. Every term near its ceiling — ZF inverts a channel it still knows.",
    "The Doppler term starts to bend. Throughput is unchanged; the index is already moving.",
    "Aging and decorrelation compound. The product falls faster than either term alone.",
    "Below γ. The inverse now amplifies error. WaveLynk has already handed off to MRT.",
    "Deep past the cliff. Fixed ZF is in collapse; the index predicted it milliseconds earlier."
  ];

  // ---- control loop animation (section 03) ----
  const loopEl = q("#wv-loop");
  if (loopEl && !reduceMotion) {
    const stages = [q("#wv-l-s1"), q("#wv-l-s2"), q("#wv-l-s3"), q("#wv-l-s4")];
    const pulse = q("#wv-l-pulse"), s3box = q("#wv-l-s3box");
    const frameEl = q("#wv-l-frame"), cciEl = q("#wv-l-cci"), modeEl = q("#wv-l-mode"), wEl = q("#wv-l-w");
    const stops = [138, 430, 722, 1028];
    let frame = 0, step = 0, zfMode = true, live = false, last = 0, acc = 0;
    const loopIo = new IntersectionObserver((es) => {
      es.forEach((e) => { live = e.isIntersecting; });
    }, { threshold: 0.35 });
    loopIo.observe(loopEl);
    const tick = (ts) => {
      requestAnimationFrame(tick);
      if (!live) { last = ts; return; }
      acc += ts - (last || ts);
      last = ts;
      if (acc < 620) return;
      acc = 0;
      step = (step + 1) % 4;
      if (step === 0) frame++;
      // CCI wanders; hysteresis at 0.60 / 0.55 prevents chatter (SwitchingConfig.hysteresis = 0.05)
      const cci = 0.42 + 0.34 * Math.sin(frame / 5.5) + 0.1 * Math.sin(frame / 1.7);
      const c = clamp(cci, 0.05, 0.99);
      if (zfMode && c >= 0.6) zfMode = false;
      else if (!zfMode && c < 0.55) zfMode = true;
      stages.forEach((g, i) => { if (g) g.setAttribute("opacity", i === step ? "1" : "0.25"); });
      if (frameEl) frameEl.textContent = String(frame % 10000).padStart(4, "0");
      if (cciEl) { cciEl.textContent = c.toFixed(2); cciEl.style.color = c >= 0.6 ? "#b4472c" : "#10161f"; }
      if (modeEl) { modeEl.textContent = zfMode ? "ZF" : "MRT"; modeEl.style.color = zfMode ? "#1a4fc4" : "#b4472c"; }
      if (wEl) wEl.textContent = zfMode ? "W ← W_ZF" : "W ← W_MRT";
      if (s3box) s3box.setAttribute("stroke", !zfMode && step === 2 ? "#b4472c" : "rgba(16,22,31,.3)");
      if (pulse) {
        pulse.setAttribute("cx", stops[step]);
        pulse.setAttribute("cy", 150);
        pulse.setAttribute("fill", zfMode ? "#1a4fc4" : "#b4472c");
        pulse.setAttribute("opacity", "1");
      }
    };
    requestAnimationFrame(tick);
  }

  // ---- scroll-driven pieces (section 01) ----
  const zf = q("#wv-zf"), ad = q("#wv-ad"), dot = q("#wv-dot"), dotZ = q("#wv-dotzf");
  const lenZ = zf ? zf.getTotalLength() : 0;
  const lenA = ad ? ad.getTotalLength() : 0;
  if (zf) { zf.style.strokeDasharray = lenZ; zf.style.strokeDashoffset = reduceMotion ? 0 : lenZ; }
  if (ad) { ad.style.strokeDasharray = lenA; ad.style.strokeDashoffset = reduceMotion ? 0 : lenA; }

  const notes = [
    "Estimate is fresh. The inversion is well conditioned and ZF delivers peak throughput.",
    "The user is moving. Doppler decorrelation begins eroding the estimate, but ZF still looks healthy.",
    "CCI is climbing toward γ. Nothing has degraded yet — this is the only warning any system gets.",
    "Threshold crossed. WaveLynk hands the precoder to MRT, which tolerates a stale estimate.",
    "Past the cliff. Fixed ZF has collapsed into 45% packet loss; WaveLynk holds near 44 ms latency."
  ];

  const onScroll = () => {
    const doc = document.documentElement;
    const p = doc.scrollTop / Math.max(1, doc.scrollHeight - doc.clientHeight);
    const bar = q("#wv-progress");
    if (bar) bar.style.width = (p * 100).toFixed(2) + "%";

    // hero parallax + fade
    if (heroIn && !reduceMotion) {
      const y = doc.scrollTop;
      const k = clamp(y / Math.max(1, window.innerHeight * 0.85), 0, 1);
      heroIn.style.transform = "translate3d(0," + (y * 0.16).toFixed(1) + "px,0)";
      heroIn.style.opacity = (1 - k * 0.85).toFixed(3);
      if (heroCv) heroCv.style.opacity = (1 - k * 0.7).toFixed(3);
    }

    // back to top
    if (toTop) {
      const on = doc.scrollTop > window.innerHeight * 0.9;
      toTop.classList.toggle("show", on);
    }

    // scroll-spy
    let act = -1;
    navTargets.forEach((sec, i) => {
      if (sec && sec.getBoundingClientRect().top <= 160) act = i;
    });
    if (act !== navActive) {
      navActive = act;
      navLinks.forEach((a, i) => {
        const on = i === act;
        a.style.color = on ? "#10161f" : "rgba(16,22,31,.55)";
        a.style.borderBottomColor = on ? "#2f6fed" : "transparent";
      });
    }

    // timeline nodes light up as they are passed
    tlNodes.forEach((n) => {
      const on = n.getBoundingClientRect().top < window.innerHeight * 0.66;
      n.classList.toggle("done", on);
    });

    const scrub = q("#wv-scrub");
    if (scrub) {
      const r = scrub.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const t = reduceMotion ? 0.5 : clamp(-r.top / Math.max(1, total), 0, 1);
      const cci = t;
      if (zf) zf.style.strokeDashoffset = lenZ * (1 - t);
      if (ad) ad.style.strokeDashoffset = lenA * (1 - t);
      const cciEl = q("#wv-cci");
      if (cciEl) cciEl.textContent = cci.toFixed(2);
      const barI = q("#wv-bar");
      if (barI) {
        barI.style.width = (cci * 100).toFixed(1) + "%";
        barI.style.background = cci >= 0.6 ? "#b4472c" : "#2f6fed";
      }
      if (dot && ad) {
        const pt = ad.getPointAtLength(lenA * t);
        dot.setAttribute("cx", pt.x);
        dot.setAttribute("cy", pt.y);
      }
      if (dotZ && zf) {
        const pz = zf.getPointAtLength(lenZ * t);
        dotZ.setAttribute("cx", pz.x);
        dotZ.setAttribute("cy", pz.y);
        dotZ.setAttribute("opacity", clamp((cci - 0.55) / 0.12, 0, 1).toFixed(2));
      }
      const mode = q("#wv-mode");
      if (mode) {
        const past = cci >= 0.6;
        mode.textContent = past ? "MAXIMUM RATIO TRANSMISSION" : "ZERO-FORCING";
        mode.style.borderColor = past ? "rgba(180,71,44,.5)" : "rgba(47,111,237,.45)";
        mode.style.background = past ? "rgba(180,71,44,.12)" : "rgba(47,111,237,.1)";
        mode.style.color = past ? "#8f3520" : "#1b4bbd";
      }
      const danger = q("#wv-danger");
      if (danger) danger.setAttribute("fill-opacity", (clamp((cci - 0.55) / 0.45, 0, 1) * 0.12).toFixed(3));
      const sw = q("#wv-switch");
      if (sw) sw.setAttribute("opacity", clamp((cci - 0.58) / 0.08, 0, 1).toFixed(2));
      const note = q("#wv-note");
      if (note) {
        const idx = cci < 0.25 ? 0 : cci < 0.45 ? 1 : cci < 0.6 ? 2 : cci < 0.72 ? 3 : 4;
        if (note.textContent !== notes[idx]) note.textContent = notes[idx];
      }
    }

    const fs = q("#wv-fscrub");
    if (fs && fPath) {
      const r = fs.getBoundingClientRect();
      const t = reduceMotion ? (REDUCED_TAU / TAUMAX) : clamp(-r.top / Math.max(1, r.height - window.innerHeight), 0, 1);
      const tau = t * TAUMAX, T = cciTerms(tau);
      fPath.style.strokeDashoffset = lenF * (1 - t);
      if (fJPath) fJPath.style.strokeDashoffset = lenFJ * (1 - t);
      const px = fx(tau), py = fy(T.cci);
      const dt = q("#wv-f-dot");
      if (dt) { dt.setAttribute("cx", px.toFixed(1)); dt.setAttribute("cy", py.toFixed(1)); dt.setAttribute("fill", T.cci < 0.6 ? "#b4472c" : "#1a4fc4"); }
      const vl = q("#wv-f-vline");
      if (vl) { vl.setAttribute("x1", px.toFixed(1)); vl.setAttribute("x2", px.toFixed(1)); vl.setAttribute("y1", py.toFixed(1)); }
      const tauEl = q("#wv-f-tau");
      if (tauEl) tauEl.textContent = (tau * 1000).toFixed(1) + " ms";
      const set = (id, bid, v) => {
        const e = q(id); if (e) e.textContent = v.toFixed(2);
        const b = q(bid); if (b) { b.style.width = (v * 100).toFixed(1) + "%"; b.style.background = v < 0.6 ? "#b4472c" : "#1a4fc4"; }
      };
      set("#wv-f-k", "#wv-fb-k", T.k);
      set("#wv-f-j", "#wv-fb-j", T.j);
      set("#wv-f-s", "#wv-fb-s", T.s);
      set("#wv-f-a", "#wv-fb-a", T.a);
      const cciEl2 = q("#wv-f-cci");
      if (cciEl2) { cciEl2.textContent = T.cci.toFixed(2); cciEl2.style.color = T.cci < 0.6 ? "#b4472c" : "#10161f"; }
      const band = q("#wv-f-band");
      if (band) band.setAttribute("fill-opacity", (clamp((0.62 - T.cci) / 0.3, 0, 1) * 0.1).toFixed(3));
      const cross = q("#wv-f-cross");
      if (cross) cross.setAttribute("opacity", clamp((tau - tauCross) / 0.0012, 0, 1).toFixed(2));
      // highlight the two terms actually moving with tau
      const hot = (el, on) => { if (el) { el.style.color = on ? "#1a4fc4" : "inherit"; el.style.background = on ? "rgba(26,79,196,.09)" : "transparent"; } };
      hot(q("#wv-t-j"), t > 0.04);
      hot(q("#wv-t-a"), t > 0.04);
      const vd = q("#wv-f-verdict");
      if (vd) {
        const i = T.cci > 0.9 ? 0 : T.cci > 0.75 ? 1 : T.cci >= 0.6 ? 2 : T.cci > 0.35 ? 3 : 4;
        if (vd.textContent !== fVerdicts[i]) vd.textContent = fVerdicts[i];
      }
    }

    const track = q("#wv-track");
    const fill = q("#wv-fill");
    if (track && fill) {
      const r = track.getBoundingClientRect();
      const t = clamp((window.innerHeight * 0.62 - r.top) / Math.max(1, r.height - 212), 0, 1);
      fill.style.height = (t * (r.height - 212)) + "px";
    }
  };

  const run = () => {
    try { onScroll(); } catch (e) { console.warn("onScroll", e); }
    if (window._wvSweep) {
      try { window._wvSweep(); } catch (e) { console.warn("sweep", e); }
    }
  };

  let scheduled = false;
  const onScrollEvent = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; run(); });
  };
  window.addEventListener("scroll", onScrollEvent, { passive: true });
  window.addEventListener("resize", onScrollEvent);
  run();
})();
