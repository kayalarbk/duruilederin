/* ============================================================
   Duru ile Derin'in Masal Kitaplığı — ortak masal motoru
   Kullanım:
     Storybook.chars(KARAKTERLER);
     Storybook.init({ pages: SAYFALAR });
   Sayfa nesnesi: { sky, html, text, restart?, init?(sceneEl) }
   ============================================================ */
"use strict";
window.Storybook = (function () {

  /* ---------- ses motoru ---------- */
  let actx = null;
  function ctx() {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
    return actx;
  }
  function tone(freq, dur, type, vol, slideTo) {
    try {
      const ac = ctx();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.type = type || "sine"; o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || .12, t + .02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + .05);
    } catch (e) { /* ses desteklenmiyorsa sessizce devam */ }
  }

  /* gerçekçi hayvan sesi çekirdeği:
     formant  → gırtlak/ağız rezonansı (bandpass filtre)
     trem     → meleme/gıdaklama titremesi (ses şiddeti dalgalanması)
     vib      → perde titremesi (Hz cinsinden sapma) */
  function voice(p) {
    try {
      const ac = ctx(), t = ac.currentTime + (p.delay || 0), dur = p.dur || .5, vol = p.vol || .12;
      const o = ac.createOscillator();
      o.type = p.type || "sawtooth";
      o.frequency.setValueAtTime(p.freq, t);
      if (p.to) o.frequency.exponentialRampToValueAtTime(p.to, t + dur);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + .04);
      g.gain.setValueAtTime(vol, t + dur * .65);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const f = ac.createBiquadFilter();
      f.type = "bandpass"; f.frequency.setValueAtTime(p.formant || 1000, t); f.Q.value = p.q || 2.5;
      if (p.trem) {
        const lfo = ac.createOscillator(), lg = ac.createGain();
        lfo.frequency.value = p.trem; lg.gain.value = vol * (p.tremDepth || .5);
        lfo.connect(lg).connect(g.gain);
        lfo.start(t); lfo.stop(t + dur + .1);
      }
      if (p.vib) {
        const v = ac.createOscillator(), vg = ac.createGain();
        v.frequency.value = p.vibRate || 6; vg.gain.value = p.vib;
        v.connect(vg).connect(o.frequency);
        v.start(t); v.stop(t + dur + .1);
      }
      o.connect(f).connect(g).connect(ac.destination);
      o.start(t); o.stop(t + dur + .1);
    } catch (e) { /* sessizce devam */ }
  }

  /* kısa gürültü patlaması (tavuk gıdaklaması, su sesi vs. için) */
  function noiseBurst(p) {
    try {
      const ac = ctx(), t = ac.currentTime + (p.delay || 0), dur = p.dur || .08;
      const len = Math.max(1, Math.floor(ac.sampleRate * dur));
      const buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = ac.createBufferSource(); src.buffer = buf;
      const f = ac.createBiquadFilter();
      f.type = "bandpass"; f.frequency.value = p.freq || 1200; f.Q.value = p.q || 1.5;
      const g = ac.createGain();
      g.gain.setValueAtTime(p.vol || .15, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f).connect(g).connect(ac.destination); src.start(t);
    } catch (e) { /* sessizce devam */ }
  }
  /* ---------- gerçek hayvan kayıtları (Wikimedia Commons, telifsiz/serbest lisans) ----------
     assets/sounds/*.mp3 — yüklenemezse aşağıdaki sentez sesler yedek olarak devreye girer */
  const SND_BASE = "assets/sounds/";
  const clips = {};
  ["kuzu", "miyav", "tavuk", "civciv", "kus", "ari"].forEach(n => {
    const a = new Audio(SND_BASE + n + ".mp3");
    a.preload = "auto";
    clips[n] = a;
  });

  /* kayıttan bir parça çal: o = {at: başlangıç sn, dur: süre sn, rate: hız, vol: ses}
     dosya henüz hazır değilse false döner → sentez yedeğe düşülür */
  function clip(name, o) {
    o = o || {};
    const base = clips[name];
    if (!base || base.readyState < 2) return false;
    const a = base.cloneNode();
    a.volume = o.vol == null ? .85 : o.vol;
    if (o.rate) {
      a.playbackRate = o.rate;
      try { a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false; } catch (e) {}
    }
    if (o.at) a.currentTime = o.at;
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
    if (o.dur) setTimeout(() => {
      const fade = setInterval(() => {
        a.volume = Math.max(0, a.volume - .15);
        if (a.volume <= 0) { clearInterval(fade); a.pause(); }
      }, 40);
    }, o.dur * 1000 / (o.rate || 1));
    return true;
  }

  const synth = {
    /* kuzu melemesi — "meee": titrek gırtlak + burun rezonansı */
    mee: () => {
      voice({freq: 620, to: 400, dur: .75, vol: .13, trem: 7, tremDepth: .6, formant: 1150, q: 2.2, vib: 14, vibRate: 7});
      voice({freq: 310, to: 200, dur: .75, vol: .08, trem: 7, tremDepth: .6, formant: 650, q: 2});
    },
    /* koç — aynı meleme, kalın ve uzun */
    meeKalin: () => {
      voice({freq: 340, to: 215, dur: .95, vol: .15, trem: 6, tremDepth: .6, formant: 720, q: 2.2, vib: 9, vibRate: 6});
      voice({freq: 170, to: 108, dur: .95, vol: .1, trem: 6, tremDepth: .6, formant: 430, q: 2});
    },
    /* kedi — "miii-yaav": önce yükselen, sonra inen miyavlama */
    miyav: () => {
      voice({freq: 480, to: 950, dur: .28, vol: .09, type: "sawtooth", formant: 1700, q: 4, vib: 16, vibRate: 9});
      voice({freq: 900, to: 360, dur: .5, vol: .11, type: "sawtooth", formant: 1250, q: 3.5, vib: 12, vibRate: 7, delay: .25});
    },
    /* civciv — kısa tiz cik-cik'ler (aşağı-yukarı perde kıvrımı) */
    cik: () => {
      [0, .15, .3].forEach(d =>
        voice({freq: 3300, to: 2500, dur: .07, vol: .09, type: "sine", formant: 3000, q: 1.4, vib: 500, vibRate: 40, delay: d}));
    },
    /* tavuk — "gıt gıt gıdaaak": boğuk gagalar + yükselen gıdak */
    gidak: () => {
      [0, .17, .34].forEach(d => {
        noiseBurst({dur: .06, vol: .1, freq: 1400, q: 1.3, delay: d});
        voice({freq: 450, to: 320, dur: .1, vol: .08, type: "square", formant: 950, q: 3, delay: d});
      });
      voice({freq: 480, to: 780, dur: .38, vol: .12, type: "sawtooth", formant: 1350, q: 3, trem: 15, tremDepth: .45, delay: .54});
    },
    /* kuş — perde kıvrımlı gerçek ötüş dizisi */
    civil: () => {
      voice({freq: 2500, to: 3900, dur: .09, vol: .07, type: "sine", formant: 3000, q: 1.2});
      voice({freq: 3500, to: 2300, dur: .1, vol: .07, type: "sine", formant: 3000, q: 1.2, delay: .13});
      voice({freq: 2700, to: 4300, dur: .13, vol: .06, type: "sine", formant: 3400, q: 1.2, vib: 300, vibRate: 28, delay: .27});
    },
    /* arı — detuneli çift kanat vızıltısı */
    vizz: () => {
      voice({freq: 172, dur: .7, vol: .05, formant: 420, q: 1, vib: 16, vibRate: 5});
      voice({freq: 181, dur: .7, vol: .04, formant: 620, q: 1, vib: 12, vibRate: 7});
    },
    tink:   () => tone(880, .18, "sine", .07, 1400),
    page:   () => tone(520, .12, "sine", .06, 700),
    pop:    () => tone(300, .15, "sine", .1, 600),
    splash: () => { noiseBurst({dur: .3, vol: .12, freq: 2400, q: .8}); tone(900, .25, "sine", .06, 200); },
    gum:    () => { tone(120, .35, "square", .12, 60); setTimeout(() => tone(90, .3, "square", .08, 50), 80); },
    yay:    () => { tone(520, .12, "triangle", .1, 780); setTimeout(() => tone(660, .12, "triangle", .1, 880), 130); setTimeout(() => tone(780, .2, "triangle", .1, 1040), 260); }
  };

  /* önce gerçek kayıt, hazır değilse sentez yedek */
  const snd = {
    mee:      () => { clip("kuzu", {vol: .9}) || synth.mee(); },
    meeKalin: () => { clip("kuzu", {rate: .62, vol: 1}) || synth.meeKalin(); },
    miyav:    () => { clip("miyav", {vol: .9}) || synth.miyav(); },
    cik:      () => { clip("civciv", {at: 9.2, dur: 2.2, vol: .8}) || synth.cik(); },
    gidak:    () => { clip("tavuk", {at: 3.6, dur: 2.3, vol: .75}) || synth.gidak(); },
    civil:    () => { clip("kus", {at: 12, dur: 2.2, vol: 1}) || synth.civil(); },
    vizz:     () => { clip("ari", {at: 6.5, dur: 2.2, vol: .9}) || synth.vizz(); },
    tink:   synth.tink,
    page:   synth.page,
    pop:    synth.pop,
    splash: synth.splash,
    gum:    synth.gum,
    yay:    synth.yay
  };
  const kindSound = { chick: snd.cik, cat: snd.miyav, sheep: snd.mee, ram: snd.meeKalin, hen: snd.gidak };

  /* ---------- karakterler ---------- */
  let CHAR = {};
  function chars(c) { CHAR = c; }

  function actor(name, cls, style, anim) {
    const c = CHAR[name];
    return `<div class="actor ${anim || ""} ${cls || ""}" data-say="${c.say}" data-kind="${c.sym}"
      style="${style};--furC:${c.fur || c.wool || "#fff"};--furD:${c.furD || "#d8c7ae"};--woolC:${c.wool || "#fff"};--faceC:${c.face || "#888"}"
      role="button" tabindex="0" aria-label="${name}">
      <svg viewBox="0 0 100 100"><use href="#${c.sym}"/></svg>
      <span class="bubble"></span>
    </div>`;
  }

  /* ---------- sahne süsleri ---------- */
  function clouds(n, skyH) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const top = 5 + Math.random() * (skyH || 30), dur = 40 + Math.random() * 40,
            delay = -Math.random() * dur, sc = .6 + Math.random() * .8;
      s += `<div class="cloud" style="top:${top}%;animation-duration:${dur}s;animation-delay:${delay}s;transform:scale(${sc})"></div>`;
    }
    return s;
  }
  function stars(n) {
    let s = "";
    for (let i = 0; i < n; i++)
      s += `<div class="star" style="left:${Math.random() * 100}%;top:${Math.random() * 60}%;animation-delay:${(Math.random() * 2.4).toFixed(2)}s"></div>`;
    return s;
  }
  function hearts(n, left, bottom) {
    let s = "";
    for (let i = 0; i < n; i++)
      s += `<div class="heart" style="left:${left + i * 6 - n * 3}%;bottom:${bottom}%;animation-delay:${(i * .9).toFixed(1)}s">💕</div>`;
    return s;
  }
  function flowers(n) {
    const em = ["🌼", "🌸", "🌷", "🌻"];
    let s = "";
    for (let i = 0; i < n; i++) {
      const left = 4 + (i + Math.random() * .7) * (92 / n), bottom = 14 + Math.random() * 6,
            sz = (3 + Math.random() * 1.6).toFixed(1);
      s += `<div class="flower" style="left:${left.toFixed(1)}%;bottom:${bottom.toFixed(1)}%;font-size:${sz}vmin;animation-delay:${(Math.random() * 2.5).toFixed(1)}s">${em[i % em.length]}</div>`;
    }
    return s;
  }
  function birds(n) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const top = 5 + Math.random() * 18, dur = 16 + Math.random() * 12, delay = -Math.random() * dur;
      s += `<div class="bird" style="top:${top.toFixed(1)}%;animation-duration:${dur.toFixed(1)}s;animation-delay:${delay.toFixed(1)}s">🐦</div>`;
    }
    return s;
  }
  function bees(n, left, bottom) {
    let s = "";
    for (let i = 0; i < n; i++)
      s += `<div class="bee" style="left:${(left || 30) + i * 14}%;bottom:${(bottom || 30) + (i % 2) * 5}%;animation-delay:${(i * 1.7).toFixed(1)}s">🐝</div>`;
    return s;
  }
  function fish(left, bottom) {
    return `<div class="fish" style="left:${left || 45}%;bottom:${bottom || 15}%">🐟</div>`;
  }

  /* ---------- kitap kurulumu ---------- */
  let pages = [], scenes = [], cur = 0, dotsEl, prevBtn, nextBtn;

  function show(i) {
    cur = Math.max(0, Math.min(pages.length - 1, i));
    scenes.forEach((s, j) => s.classList.toggle("active", j === cur));
    [...dotsEl.children].forEach((d, j) => d.classList.toggle("on", j === cur));
    prevBtn.disabled = cur === 0;
    nextBtn.disabled = cur === pages.length - 1;
    snd.page();
    const p = pages[cur];
    if (p.init && !scenes[cur]._inited) { scenes[cur]._inited = true; p.init(scenes[cur]); }
    if (p.onShow) p.onShow(scenes[cur]);
  }

  function poke(a) {
    a.querySelector(".bubble").textContent = a.dataset.say;
    a.classList.remove("jump"); void a.offsetWidth;
    a.classList.add("jump", "talking");
    (kindSound[a.dataset.kind] || snd.pop)();
    clearTimeout(a._t);
    a._t = setTimeout(() => a.classList.remove("talking"), 1600);
  }

  function init(cfg) {
    pages = cfg.pages;
    const book = document.getElementById("book");
    dotsEl = document.getElementById("dots");
    prevBtn = document.getElementById("prevBtn");
    nextBtn = document.getElementById("nextBtn");

    pages.forEach((p) => {
      const s = document.createElement("section");
      s.className = "scene"; s.dataset.sky = p.sky;
      s.innerHTML = `<div class="sky">${p.html}</div>
        <div class="panel">
          <p>${p.text}</p>
          ${p.restart ? '<button class="btn" data-act="restart">🔄 Baştan Oku</button>' : ""}
        </div>`;
      book.appendChild(s);
      dotsEl.appendChild(document.createElement("i"));
    });
    scenes = [...document.querySelectorAll(".scene")];

    prevBtn.onclick = () => show(cur - 1);
    nextBtn.onclick = () => show(cur + 1);
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") show(cur + 1);
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "Enter" || e.key === " ") {
        const a = document.activeElement;
        if (a && a.classList && a.classList.contains("actor")) { e.preventDefault(); poke(a); }
      }
    });

    document.addEventListener("click", (e) => {
      const a = e.target.closest(".actor:not(.locked)");
      if (a) { poke(a); return; }

      const deco = e.target.closest(".butterfly,.flower,.bee,.bird");
      if (deco) {
        if (deco.classList.contains("bee")) snd.vizz();
        else if (deco.classList.contains("bird")) snd.civil();
        else if (deco.classList.contains("butterfly")) snd.civil();
        else snd.pop();
        deco.classList.remove("poked"); void deco.offsetWidth;
        deco.classList.add("poked");
        clearTimeout(deco._t);
        deco._t = setTimeout(() => deco.classList.remove("poked"), 650);
        return;
      }

      const ca = e.target.closest(".cloudAnimal");
      if (ca) {
        if (/koyun/i.test(ca.dataset.say || "")) snd.mee(); else snd.pop();
        let b = ca.querySelector(".bubble");
        if (!b) { b = document.createElement("span"); b.className = "bubble"; ca.appendChild(b); }
        b.textContent = ca.dataset.say || "!";
        ca.classList.add("talking");
        clearTimeout(ca._t);
        ca._t = setTimeout(() => ca.classList.remove("talking"), 1600);
        return;
      }

      const lake = e.target.closest(".lake");
      if (lake) {
        snd.splash();
        const r = lake.getBoundingClientRect();
        const sp = document.createElement("div");
        sp.className = "splash"; sp.textContent = "💦";
        sp.style.left = ((e.clientX - r.left) / r.width * 100) + "%";
        sp.style.top = ((e.clientY - r.top) / r.height * 100) + "%";
        lake.appendChild(sp);
        setTimeout(() => sp.remove(), 900);
        return;
      }

      if (e.target.dataset.act === "start") { show(1); return; }
      if (e.target.dataset.act === "restart") { show(0); return; }

      /* boş gökyüzüne dokununca ışıltı — minikler için sürpriz! */
      const skyEl = e.target.closest(".sky");
      if (skyEl) {
        snd.tink();
        const r = skyEl.getBoundingClientRect();
        const sp = document.createElement("div");
        sp.className = "sparkle";
        sp.textContent = ["✨", "⭐", "🌟", "💫"][Math.floor(Math.random() * 4)];
        sp.style.left = ((e.clientX - r.left) / r.width * 100) + "%";
        sp.style.top = ((e.clientY - r.top) / r.height * 100) + "%";
        skyEl.appendChild(sp);
        setTimeout(() => sp.remove(), 950);
      }
    });

    show(0);
  }

  return { chars, actor, clouds, stars, hearts, flowers, birds, bees, fish, init, show, poke, snd, tone };
})();
