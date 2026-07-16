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
    miyav:  () => { tone(700, .16, "sine", .12, 950); setTimeout(() => tone(950, .3, "sine", .12, 420), 150); },
    cik:    () => { tone(1200, .09, "sine", .1, 1500); setTimeout(() => tone(1300, .09, "sine", .09, 1600), 110); },
    page:   () => tone(520, .12, "sine", .06, 700),
    pop:    () => tone(300, .15, "sine", .1, 600),
    splash: () => tone(900, .25, "sine", .08, 200),
    gum:    () => { tone(120, .35, "square", .12, 60); setTimeout(() => tone(90, .3, "square", .08, 50), 80); },
    yay:    () => { tone(520, .12, "triangle", .1, 780); setTimeout(() => tone(660, .12, "triangle", .1, 880), 130); setTimeout(() => tone(780, .2, "triangle", .1, 1040), 260); }
  };
  const kindSound = { chick: snd.cik, cat: snd.miyav, sheep: snd.mee, ram: snd.mee };

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

      const ca = e.target.closest(".cloudAnimal");
      if (ca) {
        snd.pop();
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
    });

    show(0);
  }

  return { chars, actor, clouds, stars, hearts, init, show, poke, snd, tone };
})();
