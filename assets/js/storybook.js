/* ============================================================
   Duru ile Derin'in Masal Kitaplığı — ortak masal motoru
   Kullanım:
     Storybook.chars(KARAKTERLER);
     Storybook.init({ pages: SAYFALAR });
   Sayfa nesnesi: { sky, html, text, restart?, init?(sceneEl) }
   ============================================================ */
"use strict";
window.Storybook = (function () {

  /* ---------- minik ses motoru (yumuşak, çocuk dostu) ---------- */
  let actx = null;
  function tone(freq, dur, type, vol, slideTo) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
      o.type = type || "sine"; o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || .12, t + .02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + .05);
    } catch (e) { /* ses desteklenmiyorsa sessizce devam */ }
  }
  const snd = {
    mee:    () => { tone(430, .28, "triangle", .14, 300); setTimeout(() => tone(380, .22, "triangle", .1, 280), 120); },
    meeKalin:() => { tone(250, .4, "triangle", .16, 170); setTimeout(() => tone(210, .32, "triangle", .12, 150), 170); },
    miyav:  () => { tone(700, .16, "sine", .12, 950); setTimeout(() => tone(950, .3, "sine", .12, 420), 150); },
    cik:    () => { tone(1200, .09, "sine", .1, 1500); setTimeout(() => tone(1300, .09, "sine", .09, 1600), 110); },
    gidak:  () => { [0, 110, 220, 380].forEach((d, i) => setTimeout(() => tone(560 - i * 45, .08, "square", .07, 360), d)); setTimeout(() => tone(700, .22, "square", .08, 320), 520); },
    civil:  () => { tone(1800, .07, "sine", .08, 2300); setTimeout(() => tone(2100, .09, "sine", .07, 1600), 90); setTimeout(() => tone(1900, .07, "sine", .06, 2500), 200); },
    vizz:   () => { tone(190, .45, "sawtooth", .04, 240); setTimeout(() => tone(210, .3, "sawtooth", .03, 180), 200); },
    tink:   () => tone(880, .18, "sine", .07, 1400),
    page:   () => tone(520, .12, "sine", .06, 700),
    pop:    () => tone(300, .15, "sine", .1, 600),
    splash: () => tone(900, .25, "sine", .08, 200),
    gum:    () => { tone(120, .35, "square", .12, 60); setTimeout(() => tone(90, .3, "square", .08, 50), 80); },
    yay:    () => { tone(520, .12, "triangle", .1, 780); setTimeout(() => tone(660, .12, "triangle", .1, 880), 130); setTimeout(() => tone(780, .2, "triangle", .1, 1040), 260); }
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
