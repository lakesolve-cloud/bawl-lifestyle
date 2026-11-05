(function () {
  const ALL = window.BAWL_PRODUCTS;
  const CFG = window.BAWL_CONFIG;
  const $ = (s, el = document) => el.querySelector(s);
  const naira = (n) => "₦" + Math.round(n).toLocaleString("en-NG");
  const pad = (n) => String(n).padStart(2, "0");
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} },
  };
  const byId = (id) => ALL.find((p) => p.id === id);
  const sel = Object.fromEntries(ALL.map((p) => [p.id, { color: 0, size: p.sizes.length === 1 ? p.sizes[0] : null }]));
  const colorOf = (p) => p.colors[sel[p.id].color];
  const CATS = [["all", "All"], ["tops", "Tops"], ["bottoms", "Bottoms"], ["outerwear", "Outerwear"], ["accessories", "Accessories"]];

  /* product art: on-hanger SVG, or a photo for photo-only products */
  function art(p, c, side = "front") {
    if (p.type === "card") return `<img src="${p.cardImg}" alt="${p.name}" class="card__photo" loading="lazy">`;
    return garmentSVG(p, c, side);
  }

  /* ================= RACK ================= */
  const stage = $("#stage"), track = $("#track"), hint = $("#hint"), rackIndex = $("#rackIndex");
  const rackable = ALL.filter((p) => p.type !== "card");
  let rack = rackable.slice(), slots = [], rackFilter = "all";
  const state = { idx: 0, side: "front" };
  const cur = () => rack[state.idx];

  function buildRack(focusId) {
    rack = rackable.filter((p) => rackFilter === "all" || p.cat === rackFilter);
    track.innerHTML = ""; rackIndex.innerHTML = "";
    slots = rack.map((p, i) => {
      const el = document.createElement("div");
      el.className = "slot"; el.dataset.i = i;
      el.innerHTML = `<div class="swing"><div class="flip">${garmentSVG(p, colorOf(p))}</div></div>`;
      track.appendChild(el);
      const b = document.createElement("button");
      b.dataset.i = i; b.setAttribute("aria-label", p.name); b.innerHTML = garmentSVG(p, colorOf(p));
      rackIndex.appendChild(b);
      return { el, swing: $(".swing", el), flip: $(".flip", el), a: 0, v: 0, shown: null };
    });
    const fi = focusId ? Math.max(0, rack.findIndex((p) => p.id === focusId)) : 0;
    state.idx = fi; state.side = "front";
    slots[fi].el.classList.add("is-active");
    positionTrack(true);
    renderPDP(true);
    renderChips($("#rackChips"), CATS, rackFilter, (k) => rackable.filter((p) => k === "all" || p.cat === k).length);
    setTimeout(() => { if (slots[state.idx]) slots[state.idx].v = 3; }, 300);
  }

  rackIndex.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) go(+b.dataset.i); });

  /* image preloading: a garment is only swapped in once its photo is decoded,
     so switching colour or turning a piece never shows a blank hanger */
  const imgCache = new Map();
  function preload(src) {
    if (!src) return Promise.resolve();
    if (!imgCache.has(src)) {
      const im = new Image();
      im.src = src;
      imgCache.set(src, (im.decode ? im.decode() : new Promise((r) => { im.onload = r; })).catch(() => {}));
    }
    return imgCache.get(src);
  }
  const srcFor = (p, c, side) => (side === "back" && c.back ? c.back : c.photo);

  function renderSlot(i, side, fade) {
    const s = slots[i], p = rack[i], c = colorOf(p);
    const token = (s.token = (s.token || 0) + 1);
    return preload(srcFor(p, c, side)).then(() => {
      if (slots[i] !== s || s.token !== token) return;   // a newer change won the race
      s.flip.innerHTML = garmentSVG(p, c, side);
      if (fade) s.flip.firstElementChild.classList.add("fade-in");
    });
  }
  function positionTrack(instant) {
    if (!slots.length) return;
    const w = slots[0].el.offsetWidth;
    const x = stage.clientWidth / 2 - (state.idx * w + w / 2);
    if (instant) track.style.transition = "none";
    track.style.transform = `translateX(${x}px)`;
    if (instant) { track.offsetHeight; track.style.transition = ""; }
  }
  function go(to) {
    const n = rack.length;
    const next = ((to % n) + n) % n;
    if (next === state.idx) return;
    const dir = Math.sign(to - state.idx);
    if (flipping) { clearTimeout(flipTimer); slots[state.idx].flip.classList.remove("out"); flipping = false; }
    if (state.side === "back") { renderSlot(state.idx, "front"); state.side = "front"; }
    state.idx = next;
    slots.forEach((s, i) => {
      s.el.classList.toggle("is-active", i === next);
      setTimeout(() => { s.v += -dir * (1.8 + Math.random() * 1.2); }, Math.min(8, Math.abs(i - next)) * 35);
    });
    positionTrack();
    renderPDP(true);
    hideHint();
  }

  function goToProduct(id) {
    const p = byId(id);
    if (!p) return;
    if (p.type === "card") { openQuick(p); return; }
    $("#fitting-room").scrollIntoView({ behavior: "smooth" });
    if (rackFilter !== "all" && p.cat !== rackFilter) { rackFilter = "all"; buildRack(id); return; }
    const i = rack.findIndex((x) => x.id === id);
    setTimeout(() => go(i), 450);
  }

  /* swing physics: a damped pendulum per hanger */
  let drag = null;
  (function tick() {
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      if (!(drag && drag.swinging && drag.i === i)) {
        s.v += -s.a * 0.04; s.v *= 0.965; s.a += s.v;
        if (Math.abs(s.a) < 0.005 && Math.abs(s.v) < 0.005) { s.a = 0; s.v = 0; }
      }
      const val = s.a.toFixed(2);
      if (val !== s.shown) { s.swing.style.transform = `rotate(${val}deg)`; s.shown = val; }
    }
    requestAnimationFrame(tick);
  })();

  const pivotOf = (i) => { const r = slots[i].el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 2 }; };
  const angleAt = (pv, x, y) => (-Math.atan2(x - pv.x, Math.max(24, y - pv.y)) * 180) / Math.PI;

  stage.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".arrow")) return;
    const slotEl = e.target.closest(".slot");
    const i = slotEl ? +slotEl.dataset.i : -1;
    drag = { i, x0: e.clientX, y0: e.clientY, t0: performance.now(), moved: false, swinging: false };
    if (i === state.idx) {
      drag.swinging = true; drag.pv = pivotOf(i);
      drag.start = angleAt(drag.pv, e.clientX, e.clientY); drag.a0 = slots[i].a;
      slots[i].el.classList.add("dragging");
    }
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", (e) => {
    if (!drag) { if (e.pointerType === "mouse" && slots[state.idx]) slots[state.idx].v += Math.max(-0.2, Math.min(0.2, e.movementX * 0.008)); return; }
    if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) drag.moved = true;
    if (drag.swinging) {
      const s = slots[drag.i];
      const t = Math.max(-40, Math.min(40, drag.a0 + angleAt(drag.pv, e.clientX, e.clientY) - drag.start));
      s.v = t - s.a; s.a = t;
    }
  });
  stage.addEventListener("pointerup", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0, dt = performance.now() - drag.t0;
    const s = drag.i >= 0 ? slots[drag.i] : null;
    if (s) s.el.classList.remove("dragging");
    if (Math.abs(dx) > 70 && dt < 450 && Math.abs(dx) > Math.abs(dy)) go(state.idx + (dx < 0 ? 1 : -1));
    else if (!drag.moved && drag.i >= 0 && drag.i !== state.idx) go(drag.i);
    else if (drag.swinging && drag.moved) { s.v = Math.max(-5, Math.min(5, s.v)); hideHint(); }
    else if (!drag.moved && drag.i === state.idx) s.v += 2.5;
    drag = null;
  });
  stage.addEventListener("pointercancel", () => { if (drag && drag.i >= 0 && slots[drag.i]) slots[drag.i].el.classList.remove("dragging"); drag = null; });
  $("#prevBtn").addEventListener("click", () => go(state.idx - 1));
  $("#nextBtn").addEventListener("click", () => go(state.idx + 1));

  let hintHidden = false;
  function hideHint() { if (!hintHidden) { hintHidden = true; setTimeout(() => hint.classList.add("hide"), 2500); } }
  window.addEventListener("resize", () => positionTrack(true));

  /* chips (used by rack + shop) */
  function renderChips(el, list, active, count) {
    el.innerHTML = list.map(([k, label]) => {
      const n = count ? count(k) : null;
      if (n === 0) return "";
      return `<button class="chip" role="tab" data-k="${k}" aria-selected="${k === active}">${label}${n != null ? `<small>${n}</small>` : ""}</button>`;
    }).join("");
  }
  $("#rackChips").addEventListener("click", (e) => {
    const c = e.target.closest(".chip"); if (!c || c.dataset.k === rackFilter) return;
    rackFilter = c.dataset.k; buildRack();
  });

  /* ================= PRODUCT PANEL ================= */
  const swapEls = ["#pCount", "#pName", "#pPrice", "#pTag", "#pDesc"].map((s) => $(s));
  function renderPDP(animate) {
    const p = cur(), s = sel[p.id], c = colorOf(p);
    $("#pCount").textContent = `${pad(state.idx + 1)} / ${pad(rack.length)}`;
    $("#pColl").textContent = p.collection || (p.isNew ? "New in" : "");
    $("#pName").textContent = p.name;
    $("#pPrice").textContent = naira(p.price);
    $("#pTag").textContent = p.tag;
    $("#pDesc").textContent = p.desc;
    $("#pColorName").textContent = c.n;
    $("#pColors").innerHTML = p.colors.map((col, i) =>
      `<button class="swatch" style="background:${col.b}" aria-pressed="${i === s.color}" aria-label="${col.n}" title="${col.n}" data-c="${i}"></button>`).join("");
    const sz = $("#pSizes");
    sz.classList.toggle("sizes--one", p.sizes.length === 1);
    sz.innerHTML = p.sizes.map((x) => `<button class="size" aria-pressed="${x === s.size}" data-s="${x}">${x}</button>`).join("");
    $("#addBtn").textContent = s.size ? `Add to bag — ${naira(p.price)}` : "Select a size";
    const flip = $("#flipBtn");
    flip.hidden = !hasBackView(p, c);
    flip.textContent = state.side === "front" ? "View back" : "View front";
    $("#stageBadge").hidden = !p.isNew;
    const gal = p.gallery || [];
    $("#pSeenWrap").hidden = !gal.length;
    $("#pSeen").innerHTML = gal.map((src) => `<button data-src="${src}" aria-label="Open photo"><img src="${src}" alt="${p.name} on Instagram" loading="lazy"></button>`).join("");
    [...rackIndex.children].forEach((b, i) => b.setAttribute("aria-current", i === state.idx));
    const cb = rackIndex.children[state.idx];
    if (cb) rackIndex.scrollTo({ left: cb.offsetLeft - rackIndex.offsetLeft - rackIndex.clientWidth / 2 + cb.offsetWidth / 2, behavior: "smooth" });
    if (animate) swapEls.forEach((el) => { el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap"); });
  }

  $("#pColors").addEventListener("click", (e) => {
    const b = e.target.closest(".swatch"); if (!b) return;
    const p = cur();
    if (+b.dataset.c === sel[p.id].color) return;
    if (flipping) { clearTimeout(flipTimer); slots[state.idx].flip.classList.remove("out"); flipping = false; }
    sel[p.id].color = +b.dataset.c;
    if (state.side === "back" && !hasBackView(p, colorOf(p))) state.side = "front";
    renderSlot(state.idx, state.side, true);
    rackIndex.children[state.idx].innerHTML = garmentSVG(p, colorOf(p));
    refreshCards(p.id);
    slots[state.idx].v += 1.4;
    renderPDP();
  });
  $("#pSizes").addEventListener("click", (e) => {
    const b = e.target.closest(".size"); if (!b) return;
    sel[cur().id].size = b.dataset.s; renderPDP();
  });
  let flipping = false, flipTimer = 0;
  $("#flipBtn").addEventListener("click", () => {
    if (flipping) return;
    const p = cur(), next = state.side === "front" ? "back" : "front";
    if (next === "back" && !hasBackView(p, colorOf(p))) return;
    flipping = true;
    const idx = state.idx, s = slots[idx];
    preload(srcFor(p, colorOf(p), next));               // start loading while it turns
    s.flip.classList.add("out");
    flipTimer = setTimeout(() => {
      state.side = next;
      renderSlot(idx, next).then(() => {
        s.flip.classList.remove("out"); s.v += 1.2;
        flipping = false; renderPDP();
      });
    }, 240);
  });
  $("#addBtn").addEventListener("click", () => {
    const p = cur(), s = sel[p.id];
    if (!s.size) { toast("Please choose a size"); const sz = $("#pSizes"); sz.classList.remove("swap"); void sz.offsetWidth; sz.classList.add("swap"); return; }
    addToBag(p.id, s.color, s.size);
    slots[state.idx].v -= 3;
    openBag();
  });

  /* ================= CARDS ================= */
  function cardHTML(p, opts = {}) {
    const alt = p.cardAlt || (p.gallery || []).find((g) => /look\//.test(g)) || (p.gallery || []).find((g) => !/flannel-jeans|tee-sweats|pa-2|pc-1/.test(g));
    const badge = p.isNew ? `<span class="card__badge card__badge--new">New</span>` : "";
    return `<button class="card" data-id="${p.id}">
      <div class="card__media">
        ${badge}
        ${p.type === "card" ? art(p, colorOf(p)) : `<div class="card__art">${art(p, colorOf(p))}</div>`}
        ${alt ? `<img class="card__alt" src="${alt}" alt="" loading="lazy">` : ""}
        <span class="card__try">${p.type === "card" ? "Quick add" : "Try on the rack"}</span>
      </div>
      <div class="card__info">
        <div><div class="card__name">${p.name}</div><div class="card__meta">${p.colors.length > 1 ? p.colors.length + " colours" : p.colors[0].n}</div>
          ${opts.dots === false ? "" : `<div class="card__dots">${p.colors.map((c) => `<i style="background:${c.b}"></i>`).join("")}</div>`}</div>
        <div>${naira(p.price)}</div>
      </div>
    </button>`;
  }
  function refreshCards(id) {
    document.querySelectorAll(`.card[data-id="${id}"] .card__art`).forEach((el) => { const p = byId(id); el.innerHTML = art(p, colorOf(p)); });
  }
  document.addEventListener("click", (e) => {
    const c = e.target.closest(".card[data-id], .mini[data-id], [data-goto]");
    if (c) { goToProduct(c.dataset.id || c.dataset.goto); return; }
    const f = e.target.closest("[data-filter]");
    if (f) { shopFilter = f.dataset.filter; renderShop(); $("#shop").scrollIntoView({ behavior: "smooth" }); }
  });

  /* shop */
  const SHOP_CATS = [["all", "All"], ["new", "New in"], ...CATS.slice(1)];
  let shopFilter = "all";
  const shopMatch = (p, k) => k === "all" || (k === "new" ? p.isNew : k === "dreams" ? p.collection === "Dreams Are Made Here" : p.cat === k);
  function renderShop() {
    renderChips($("#shopChips"), SHOP_CATS, shopFilter, (k) => ALL.filter((p) => shopMatch(p, k)).length);
    $("#shopGrid").innerHTML = ALL.filter((p) => shopMatch(p, shopFilter)).map((p, i) => cardHTML(p).replace('class="card"', `class="card" style="animation-delay:${Math.min(i, 8) * 40}ms"`)).join("");
  }
  $("#shopChips").addEventListener("click", (e) => { const c = e.target.closest(".chip"); if (c) { shopFilter = c.dataset.k; renderShop(); } });

  /* dreams collection + accessories */
  $("#dreamsGrid").innerHTML = ["bawl-27-vest", "side-tape-trousers", "denim-shorts", "crossbody-bag"].map(byId).filter(Boolean).map((p) => cardHTML(p)).join("");
  $("#finishItems").innerHTML = ALL.filter((p) => p.cat === "accessories").map((p) =>
    `<button class="mini" data-id="${p.id}"><span class="mini__img">${p.type === "card" ? `<img src="${p.cardImg}" alt="">` : garmentSVG(p, colorOf(p))}</span>
      <span><b>${p.name}</b><small>${naira(p.price)}</small></span></button>`).join("");

  /* quick add (photo-only products like socks) */
  const quick = document.createElement("div");
  quick.className = "modal"; quick.hidden = true;
  quick.innerHTML = `<div class="modal__box quick"><button class="icon-btn modal__close" data-close aria-label="Close">✕</button><div class="quick__body"></div></div>`;
  document.body.appendChild(quick);
  function openQuick(p) {
    const s = sel[p.id];
    $(".quick__body", quick).innerHTML = `
      <img src="${p.cardImg}" alt="${p.name}" style="width:100%;aspect-ratio:1;object-fit:cover;margin-bottom:18px">
      <p class="label">${p.collection || "Accessories"}</p>
      <h3 style="font-family:var(--serif);font-size:34px;font-weight:400;margin:6px 0 4px">${p.name}</h3>
      <p style="font-weight:500">${naira(p.price)}</p>
      <p class="muted small" style="margin:8px 0 18px">${p.desc}</p>
      <button class="btn btn--dark btn--full" id="quickAdd">Add to bag — ${naira(p.price)}</button>`;
    quick.hidden = false;
    $("#quickAdd").onclick = () => { addToBag(p.id, s.color, s.size || p.sizes[0]); quick.hidden = true; openBag(); };
  }
  quick.addEventListener("click", (e) => { if (e.target === quick || e.target.closest("[data-close]")) quick.hidden = true; });

  /* ================= LOOKBOOK ================= */
  const LOOKS = [
    ["images/look/jacket-c5.jpg", "Now You See Me", "tall"],
    ["images/look/pb-6.jpg", "Denim shorts + crossbody", "wide"],
    ["images/look/tank-c2.jpg", "Rib tank", ""],
    ["images/look/pb-2.jpg", "Crest beanies", ""],
    ["images/look/jacket-c3.jpg", "Black leather", ""],
    ["images/look/pb-3.jpg", "Crew socks", ""],
    ["images/look/tank-c5.jpg", "Rib tanks", "wide"],
    ["images/ig/rent-group.jpg", "Rent Is Due Everyday", ""],
    ["images/look/jacket-c2.jpg", "Olive twill", ""],
  ];
  $("#lookbookGrid").innerHTML = LOOKS.map(([src, cap, cls]) =>
    `<figure class="${cls} reveal" data-src="${src}"><img src="${src}" alt="${cap}" loading="lazy"><figcaption>${cap}</figcaption></figure>`).join("");
  const lightbox = $("#lightbox");
  function openLightbox(src) { $("#lightboxImg").src = src; lightbox.hidden = false; }
  lightbox.addEventListener("click", () => (lightbox.hidden = true));
  $("#lookbookGrid").addEventListener("click", (e) => { const f = e.target.closest("figure"); if (f) openLightbox(f.dataset.src); });
  $("#pSeen").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) openLightbox(b.dataset.src); });
  document.querySelectorAll(".finish figure").forEach((f) => f.addEventListener("click", () => openLightbox($("img", f).src)));

  const sizeGuide = $("#sizeGuide");
  $("#sizeGuideBtn").addEventListener("click", () => (sizeGuide.hidden = false));
  sizeGuide.addEventListener("click", (e) => { if (e.target === sizeGuide || e.target.closest("[data-close]")) sizeGuide.hidden = true; });

  /* ================= EVENT ================= */
  const ev = CFG.event;
  if (ev) {
    const start = new Date(ev.start), end = new Date(ev.end);
    $("#evKicker").textContent = ev.kicker;
    $("#evTitle").textContent = ev.title;
    $("#evBlurb").textContent = ev.blurb;
    $("#evDate").textContent = start.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" }) + " · " +
      start.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos" });
    $("#evVenue").textContent = `${ev.venue}, ${ev.area}`;
    $("#evMap").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${ev.venue} ${ev.area}`);
    const units = { d: 864e5, h: 36e5, m: 6e4, s: 1e3 };
    const tickCd = () => {
      let ms = start - Date.now();
      if (ms <= 0) {
        $("#countdown").innerHTML = `<div><b>${Date.now() < end ? "Happening now" : "Thank you for pulling up"}</b></div>`;
        return false;
      }
      for (const [u, size] of Object.entries(units)) { const v = Math.floor(ms / size); ms -= v * size; $(`[data-u="${u}"]`).textContent = pad(v); }
      return true;
    };
    if (tickCd()) { const t = setInterval(() => { if (!tickCd()) clearInterval(t); }, 1000); }
    $("#evCal").addEventListener("click", () => {
      const f = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//BAWL//Pop-up//EN", "BEGIN:VEVENT", `UID:bawl-popup-${f(start)}@bawl.com.ng`, `DTSTAMP:${f(new Date())}`,
        `DTSTART:${f(start)}`, `DTEND:${f(end)}`, `SUMMARY:${ev.title} — BAWL pop-up`, `LOCATION:${ev.venue}\\, ${ev.area.replace(/,/g, "\\,")}`,
        `DESCRIPTION:${ev.blurb.replace(/,/g, "\\,")}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "bawl-experience.ics";
      document.body.appendChild(a); a.click(); a.remove();
    });
  }

  /* ================= MEMBERS ================= */
  $("#membersForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = e.target.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { toast("Enter a valid email address"); return; }
    const list = store.get("bawl-members", []); if (!list.includes(v)) list.push(v); store.set("bawl-members", list);
    e.target.reset(); toast("Welcome, Top Member. You'll hear about the next drop first.");
  });

  /* ================= BAG ================= */
  let bag = store.get("bawl-bag", []).filter((it) => byId(it.id) && byId(it.id).colors[it.color]);
  const subtotal = () => bag.reduce((n, it) => n + it.qty * byId(it.id).price, 0);
  const thumb = (p, c) => (p.type === "card" ? `<img src="${p.cardImg}" alt="">` : garmentSVG(p, c));

  function addToBag(id, color, size) {
    const f = bag.find((it) => it.id === id && it.color === color && it.size === size);
    if (f) f.qty++; else bag.push({ id, color, size, qty: 1 });
    store.set("bawl-bag", bag); renderBag();
    const b = $("#bagBtn"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
  }
  function renderBag() {
    $("#bagCount").textContent = bag.reduce((n, it) => n + it.qty, 0);
    $("#bagTotal").textContent = naira(subtotal());
    $("#bagFoot").hidden = !bag.length;
    $("#bagItems").innerHTML = bag.length
      ? bag.map((it, k) => {
          const p = byId(it.id), c = p.colors[it.color];
          return `<div class="line-item">
            <div class="line-item__img">${thumb(p, c)}</div>
            <div><div class="line-item__name">${p.name}</div><div class="line-item__meta">${c.n} · ${it.size}</div>
              <div class="qty"><button data-k="${k}" data-d="-1" aria-label="Decrease quantity">−</button><span>${it.qty}</span><button data-k="${k}" data-d="1" aria-label="Increase quantity">+</button></div></div>
            <div class="line-item__right"><span>${naira(p.price * it.qty)}</span><button class="line-item__remove" data-rm="${k}">Remove</button></div>
          </div>`;
        }).join("")
      : `<div class="drawer__empty"><p>Your bag is empty.</p><a href="#shop" class="btn btn--line" id="emptyShop">Shop the collection</a></div>`;
  }
  $("#bagItems").addEventListener("click", (e) => {
    const q = e.target.closest("button[data-k]"), rm = e.target.closest("[data-rm]");
    if (q) { const it = bag[+q.dataset.k]; it.qty += +q.dataset.d; if (it.qty <= 0) bag.splice(+q.dataset.k, 1); }
    else if (rm) bag.splice(+rm.dataset.rm, 1);
    else if (e.target.closest("#emptyShop")) { closeBag(); return; }
    else return;
    store.set("bawl-bag", bag); renderBag();
  });
  const drawer = $("#drawer"), scrim = $("#scrim");
  function openBag() { drawer.classList.add("open"); scrim.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); }
  function closeBag() { drawer.classList.remove("open"); scrim.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); }
  $("#bagBtn").addEventListener("click", openBag);
  $("#closeBag").addEventListener("click", closeBag);
  scrim.addEventListener("click", closeBag);

  /* ================= CHECKOUT ================= */
  const checkout = $("#checkout"), form = $("#checkoutForm");
  const STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT – Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];
  $("#stateSelect").innerHTML = `<option value="">Select state</option>` + STATES.map((s) => `<option>${s}</option>`).join("");
  const hasBank = CFG.bank && CFG.bank.accountNumber;
  const PAYMENTS = [
    CFG.paystackPublicKey && { id: "paystack", label: "Pay now", note: "Card, bank transfer or USSD — secured by Paystack" },
    { id: "transfer", label: "Bank transfer", note: hasBank ? "Transfer to our account, then send proof of payment" : "We'll send our account details to confirm your order" },
    { id: "chat", label: `Confirm on ${CFG.whatsappNumber ? "WhatsApp" : "Instagram"} first`, note: "We confirm availability, then you pay" },
  ].filter(Boolean);
  $("#deliveryChoices").innerHTML = CFG.delivery.map((d, i) => `
    <label class="choice"><input type="radio" name="delivery" value="${d.id}" ${i === 0 ? "checked" : ""}>
      <span class="choice__main">${d.label}<small>${d.note}</small></span><span class="choice__price">${d.price ? naira(d.price) : "Free"}</span></label>`).join("");
  $("#paymentChoices").innerHTML = PAYMENTS.map((p, i) => `
    <label class="choice"><input type="radio" name="payment" value="${p.id}" ${i === 0 ? "checked" : ""}>
      <span class="choice__main">${p.label}<small>${p.note}</small></span></label>`).join("");
  const deliveryOf = () => CFG.delivery.find((d) => d.id === form.delivery.value) || CFG.delivery[0];

  function renderSummary() {
    const del = deliveryOf();
    $("#summaryItems").innerHTML = bag.map((it) => {
      const p = byId(it.id), c = p.colors[it.color];
      return `<div class="sum-item"><div class="sum-item__img">${thumb(p, c)}<i>${it.qty}</i></div>
        <div><div>${p.name}</div><div class="muted small">${c.n} · ${it.size}</div></div><div>${naira(p.price * it.qty)}</div></div>`;
    }).join("");
    $("#sumSubtotal").textContent = naira(subtotal());
    $("#sumDelivery").textContent = del.price ? naira(del.price) : "Free";
    $("#sumTotal").textContent = naira(subtotal() + del.price);
    $("#placeOrderBtn").textContent = `Place order — ${naira(subtotal() + del.price)}`;
    const pickup = del.id === "pickup";
    $("#addressFields").hidden = pickup;
    ["address", "city", "state"].forEach((n) => (form[n].required = !pickup));
    if (del.id === "lagos" && !form.state.value) form.state.value = "Lagos";
  }
  form.addEventListener("change", renderSummary);
  function openCheckout() {
    if (!bag.length) { toast("Your bag is empty"); return; }
    closeBag();
    $("#checkoutBody").hidden = false; $("#confirm").hidden = true;
    renderSummary();
    checkout.classList.add("open"); checkout.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; checkout.scrollTop = 0;
  }
  function closeCheckout() { checkout.classList.remove("open"); checkout.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
  $("#checkoutBtn").addEventListener("click", openCheckout);
  $("#closeCheckout").addEventListener("click", closeCheckout);
  $("#cDone").addEventListener("click", closeCheckout);

  function validate() {
    let ok = true;
    form.querySelectorAll(".field").forEach((f) => f.classList.remove("invalid"));
    [...form.elements].forEach((el) => {
      if (!el.name || el.type === "radio") return;
      let bad = el.required && !el.value.trim();
      if (!bad && el.name === "email" && el.value) bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      if (!bad && el.name === "phone" && el.value) bad = el.value.replace(/\D/g, "").length < 10;
      if (bad) { ok = false; el.closest(".field").classList.add("invalid"); }
    });
    return ok;
  }
  function orderText(o) {
    const lines = o.items.map((it) => `• ${it.qty} × ${it.name} (${it.color}, ${it.size}) — ${naira(it.price * it.qty)}`);
    return [`New BAWL order ${o.id}`, ...lines, `Subtotal: ${naira(o.subtotal)}`,
      `Delivery: ${o.delivery.label} — ${o.delivery.price ? naira(o.delivery.price) : "Free"}`, `Total: ${naira(o.total)}`,
      `Payment: ${o.paid ? "PAID via Paystack (ref " + o.reference + ")" : o.payment.label}`, ``,
      `Name: ${o.customer.name}`, `Phone: ${o.customer.phone}`, `Email: ${o.customer.email}`,
      o.delivery.id !== "pickup" ? `Address: ${o.customer.address}, ${o.customer.city}, ${o.customer.state}` : `Pickup`,
      o.customer.note ? `Note: ${o.customer.note}` : ""].filter((l) => l !== "").join("\n");
  }
  const contactLink = (text) => CFG.whatsappNumber
    ? { href: `https://wa.me/${CFG.whatsappNumber}?text=${encodeURIComponent(text)}`, label: "Send order on WhatsApp" }
    : { href: `https://ig.me/m/${CFG.instagram}`, label: "Send order on Instagram", copy: true };
  const loadScript = (src) => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    $("#formError").textContent = "";
    if (!validate()) { $("#formError").textContent = "Please check the highlighted fields."; form.querySelector(".invalid input, .invalid select")?.focus(); return; }
    const del = deliveryOf(), pay = PAYMENTS.find((p) => p.id === form.payment.value), fd = Object.fromEntries(new FormData(form));
    const order = {
      id: "BAWL-" + Date.now().toString(36).toUpperCase().slice(-6), date: new Date().toISOString(),
      items: bag.map((it) => { const p = byId(it.id); return { id: p.id, name: p.name, color: p.colors[it.color].n, size: it.size, qty: it.qty, price: p.price }; }),
      subtotal: subtotal(), delivery: del, total: subtotal() + del.price, payment: pay,
      customer: { name: fd.name.trim(), phone: fd.phone.trim(), email: fd.email.trim(), address: fd.address || "", city: fd.city || "", state: fd.state || "", note: fd.note || "" },
      paid: false,
    };
    if (pay.id === "paystack") {
      const btn = $("#placeOrderBtn"); btn.disabled = true; btn.textContent = "Opening secure payment…";
      try {
        await loadScript("https://js.paystack.co/v2/inline.js");
        new window.PaystackPop().newTransaction({
          key: CFG.paystackPublicKey, email: order.customer.email, amount: order.total * 100, currency: "NGN",
          reference: order.id + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
          metadata: { order_id: order.id, custom_fields: [
            { display_name: "Customer", variable_name: "customer", value: order.customer.name },
            { display_name: "Phone", variable_name: "phone", value: order.customer.phone },
            { display_name: "Delivery", variable_name: "delivery", value: order.delivery.id === "pickup" ? "Pickup" : `${order.customer.address}, ${order.customer.city}, ${order.customer.state}` },
            { display_name: "Items", variable_name: "items", value: order.items.map((i) => `${i.qty}x ${i.name} (${i.color}, ${i.size})`).join("; ") },
          ] },
          onSuccess: (t) => { order.paid = true; order.reference = t.reference; complete(order); },
          onCancel: () => { toast("Payment cancelled — your bag is saved"); renderSummary(); btn.disabled = false; },
        });
      } catch (_) {
        $("#formError").textContent = "Couldn't reach the payment service. Check your connection or choose another payment option.";
        btn.disabled = false; renderSummary();
      }
      return;
    }
    complete(order);
  });

  function complete(order) {
    const orders = store.get("bawl-orders", []); orders.push(order); store.set("bawl-orders", orders);
    bag = []; store.set("bawl-bag", bag); renderBag();
    $("#placeOrderBtn").disabled = false;
    const text = orderText(order), link = contactLink(text);
    $("#cName").textContent = order.customer.name.split(" ")[0];
    $("#cId").textContent = order.id;
    const msg = $("#cMessage"); msg.innerHTML = "";
    const p = (t) => { const el = document.createElement("p"); el.textContent = t; msg.appendChild(el); };
    if (order.paid) p(`Payment of ${naira(order.total)} received. We'll contact you on ${order.customer.phone} about delivery.`);
    else if (order.payment.id === "transfer") {
      p(`Your total is ${naira(order.total)}.`);
      if (hasBank) {
        const box = document.createElement("div"); box.className = "bank-box";
        [["Bank", CFG.bank.bankName], ["Account name", CFG.bank.accountName], ["Account number", CFG.bank.accountNumber], ["Reference", order.id]]
          .forEach(([k, v]) => { const r = document.createElement("div"); r.innerHTML = `<span></span><b></b>`; r.children[0].textContent = k; r.children[1].textContent = v; box.appendChild(r); });
        msg.appendChild(box);
        p("After paying, send your order and proof of payment below so we can confirm it.");
      } else p("Send your order below and we'll reply with our account details.");
    } else p("Send your order below. We'll confirm availability and share how to pay.");
    const actions = $("#cActions"); actions.innerHTML = "";
    const a = document.createElement("a");
    a.className = "btn btn--dark btn--full"; a.href = link.href; a.target = "_blank"; a.rel = "noopener"; a.textContent = link.label;
    a.addEventListener("click", () => { try { navigator.clipboard && navigator.clipboard.writeText(text); } catch (_) {} if (link.copy) toast("Order details copied — paste them in the DM"); });
    actions.appendChild(a);
    if (link.copy) { const n = document.createElement("p"); n.className = "muted small"; n.textContent = "Your order details are copied when you tap the button, so you can paste them in the DM."; actions.appendChild(n); }
    $("#checkoutBody").hidden = true; $("#confirm").hidden = false; checkout.scrollTop = 0;
  }

  /* ================= MISC ================= */
  let toastT;
  function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600); }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeBag(); sizeGuide.hidden = true; lightbox.hidden = true; quick.hidden = true; if (checkout.classList.contains("open") && $("#confirm").hidden) closeCheckout(); return; }
    if (drawer.classList.contains("open") || checkout.classList.contains("open")) return;
    if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const r = $("#fitting-room").getBoundingClientRect();
    if (r.top > innerHeight || r.bottom < 0) return;
    if (e.key === "ArrowRight") go(state.idx + 1);
    if (e.key === "ArrowLeft") go(state.idx - 1);
  });

  const header = $("#header");
  window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 10), { passive: true });

  /* scroll reveals */
  const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;
  document.querySelectorAll(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));

  $("#year").textContent = new Date().getFullYear();
  renderShop();
  renderBag();
  buildRack();
  // warm the cache with every colourway + back view so swatches switch instantly
  const warm = () => ALL.forEach((p) => p.colors.forEach((c) => { preload(c.photo); preload(c.back); }));
  if (document.readyState === "complete") warm(); else window.addEventListener("load", warm);
  if (document.fonts) document.fonts.ready.then(() => { rack.forEach((_, i) => renderSlot(i, i === state.idx ? state.side : "front")); positionTrack(true); });
})();
