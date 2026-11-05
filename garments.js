/*
  Renders a garment hanging on a hanger as an SVG string.
  viewBox 0 0 300 400 · the hook tip sits at (150, 2) – the swing pivot.
  Photo products (cut-out PNGs) hang on the same hanger as drawn ones.
*/
(function () {
  let uid = 0;

  /* ---------- hardware ---------- */
  const metalDefs = (id) => `
    <linearGradient id="m${id}" x1="0" x2="1">
      <stop offset="0" stop-color="#8a8a8a"/><stop offset=".45" stop-color="#ededed"/><stop offset="1" stop-color="#9c9c9c"/>
    </linearGradient>`;

  const hook = (id, end = 46) => `
    <path d="M150 ${end} V32 C150 24 160 22 160 12.5 C160 5.5 155.5 2 150 2 C144.5 2 141 5.5 141 10"
      fill="none" stroke="url(#m${id})" stroke-width="2.6" stroke-linecap="round"/>`;

  const shoulderHanger = (id, hw = 78) => {
    const l = 150 - hw, r = 150 + hw, y = 47 + hw * 0.47;
    return `
    ${hook(id)}
    <path d="M${l} ${y} C${150 - hw * .64} ${y - 14} ${150 - hw * .28} 56 150 47 C${150 + hw * .28} 56 ${150 + hw * .64} ${y - 14} ${r} ${y}" fill="none" stroke="#151515" stroke-width="7" stroke-linecap="round"/>
    <rect x="146.5" y="41" width="7" height="9" rx="2" fill="url(#m${id})"/>`;
  };

  const clipHangerBack = (id) => `
    ${hook(id, 44)}
    <rect x="146.5" y="38" width="7" height="8" rx="2" fill="url(#m${id})"/>
    <path d="M70 47 H230" stroke="#151515" stroke-width="5" stroke-linecap="round"/>
    <path d="M71 45.6 H229" stroke="rgba(255,255,255,.25)" stroke-width="1"/>`;

  const clip = (x, id) => `
    <rect x="${x - 8}" y="43" width="16" height="30" rx="3" fill="#151515"/>
    <rect x="${x - 8}" y="43" width="16" height="6" rx="2" fill="#262626"/>
    <circle cx="${x}" cy="47" r="2" fill="url(#m${id})"/>`;

  /* ---------- shared bits for drawn garments ---------- */
  const SHORT_SLEEVE = (neck) =>
    `M120,58 Q150,${neck} 180,58 L215,66 L262,108 L240,142 L215,126 L215,312 Q150,318 85,312 L85,126 L60,142 L38,108 L85,66 Z`;
  const LONG_SLEEVE = (neck) =>
    `M120,58 Q150,${neck} 180,58 L216,68 Q244,84 252,140 L264,268 L234,272 L222,150 L218,312 Q150,318 82,312 L78,150 L66,272 L36,268 L48,140 Q56,84 84,68 Z`;
  const TANK = (neck) =>
    `M118,58 Q150,${neck} 182,58 L198,60 Q202,100 224,118 L224,330 Q150,336 76,330 L76,118 Q98,100 102,60 Z`;

  const fabricDefs = (id, gloss) => `
    <linearGradient id="sh${id}" x1="0" x2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".14"/>
    </linearGradient>
    <linearGradient id="vs${id}" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".09"/>
    </linearGradient>
    ${gloss ? `<linearGradient id="gl${id}" x1="0" x2="1" y1="0" y2="1">
      <stop offset=".2" stop-color="#fff" stop-opacity="0"/><stop offset=".36" stop-color="#fff" stop-opacity=".16"/>
      <stop offset=".46" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity=".07"/>
      <stop offset=".8" stop-color="#fff" stop-opacity="0"/></linearGradient>` : ""}`;

  const shade = (d, id, gloss) =>
    `<path d="${d}" fill="url(#sh${id})"/><path d="${d}" fill="url(#vs${id})"/>${gloss ? `<path d="${d}" fill="url(#gl${id})"/>` : ""}`;

  const seam = (d, o = 0.09) => `<path d="${d}" fill="none" stroke="rgba(0,0,0,${o})" stroke-width="1"/>`;
  const sans = (x, y, size, fill, s, extra = "") =>
    `<text x="${x}" y="${y}" font-family="Inter, Helvetica, Arial, sans-serif" font-weight="700" font-size="${size}" fill="${fill}" text-anchor="middle" ${extra}>${s}</text>`;

  /* ---------- drawn garments ---------- */
  /* real print artwork lifted from the Instagram photos, recoloured per colourway */
  const tintDefs = (id, color) => `
    <filter id="t${id}" color-interpolation-filters="sRGB"><feFlood flood-color="${color}"/><feComposite in2="SourceAlpha" operator="in"/></filter>
    <filter id="n${id}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .07 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="b${id}"><feGaussianBlur stdDeviation="3"/></filter>`;
  const printImg = (id, src, x, y, w, h) =>
    `<image href="${src}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" filter="url(#t${id})"/>`;
  const softFolds = (id, list, o = 0.07) =>
    `<g filter="url(#b${id})" opacity="${o}">${list.map((d) => `<path d="${d}" fill="none" stroke="#000" stroke-width="7" stroke-linecap="round"/>`).join("")}</g>`;

  // oversized boxy tee: dropped shoulders, elbow-length sleeves
  const BOXY_TEE = (neck) =>
    `M121,58 Q150,${neck} 179,58 L224,70 Q248,104 270,152 L236,168 L224,142 L224,318 Q150,323 76,318 L76,142 L64,168 L30,152 Q52,104 76,70 Z`;

  function tee(c, side, id) {
    const back = side === "back";
    const d = BOXY_TEE(back ? 64 : 80);
    return `
      <defs>${tintDefs(id, c.ink)}</defs>
      <path d="M118,58 Q150,50 182,58 Q150,68 118,58 Z" fill="${c.alt}"/>
      ${shoulderHanger(id)}
      <path d="${d}" fill="${c.b}"/>
      <path d="${d}" fill="#000" filter="url(#n${id})"/>
      ${back
        ? `<path d="M118,57 Q150,74 182,57 L179,58 Q150,66 121,58 Z" fill="${c.alt}"/>
           ${sans(150, 86, 6, c.ink, "BAWL", 'letter-spacing="2"')}`
        : `<path d="M114,56 Q150,94 186,56 L179,58 Q150,80 121,58 Z" fill="${c.alt}"/>
           ${printImg(id, "images/products/print-rent.png", 98, 104, 110, 130)}`}
      ${softFolds(id, ["M104,170 Q112,240 100,312", "M196,176 Q188,246 200,312", "M232,120 Q244,140 250,158", "M68,120 Q56,140 50,158"])}
      ${seam("M76,142 Q80,104 76,70", .07)}${seam("M224,142 Q220,104 224,70", .07)}
      ${seam("M77,310 Q150,315 223,310", .1)}
      ${shade(d, id)}`;
  }

  // heavyweight hoodie with the real BAWL brain-crest logo
  function hoodie(c, side, id) {
    const back = side === "back";
    const body = "M116,94 Q150,114 184,94 L222,104 Q248,112 256,144 L274,318 L238,325 L226,178 L229,342 Q150,348 71,342 L74,178 L62,325 L26,318 L44,144 Q52,112 78,104 Z";
    const hood = "M100,100 C90,58 110,22 150,20 C190,22 210,58 200,100 Z";
    const rib = (d) => `<path d="${d}" fill="${c.alt}"/>`;
    const ribLinesIn = (x1, x2, y1, y2, step = 3.4) => Array.from({ length: Math.floor((x2 - x1) / step) }, (_, i) => seam(`M${x1 + 2 + i * step},${y1} L${x1 + 2 + i * step},${y2}`, 0.13)).join("");
    return `
      <defs>${tintDefs(id, c.ink)}
        <radialGradient id="hl${id}" cx=".38" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".09"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      </defs>
      ${back ? "" : `
        <path d="${hood}" fill="${c.b}"/>
        <path d="${hood}" fill="rgba(0,0,0,.16)"/>
        <path d="M117,100 C112,66 126,40 150,39 C174,40 188,66 183,100 Q150,116 117,100 Z" fill="${c.alt}"/>
        <path d="M117,100 C112,66 126,40 150,39 C174,40 188,66 183,100 Q150,116 117,100 Z" fill="rgba(0,0,0,.28)"/>
        <path d="M125,96 C122,70 132,52 150,51 C168,52 178,70 175,96" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="5" filter="url(#b${id})"/>`}
      <path d="${body}" fill="${c.b}"/>
      <path d="${body}" fill="#000" filter="url(#n${id})"/>
      ${rib("M26,318 L62,325 L61,348 L28,342 Z")}${rib("M238,325 L274,318 L272,342 L239,348 Z")}
      ${ribLinesIn(28, 61, 322, 345)}${ribLinesIn(239, 272, 322, 345)}
      ${rib("M71,342 Q150,348 229,342 L229,368 Q150,374 71,368 Z")}
      ${ribLinesIn(72, 228, 346, 370, 3.6)}
      ${seam("M78,104 Q88,142 74,178", .16)}${seam("M222,104 Q212,142 226,178", .16)}
      ${back
        ? `<path d="M104,92 C98,62 114,40 150,38 C186,40 202,62 196,92 Q198,150 150,170 Q102,150 104,92 Z" fill="${c.b}"/>
           <path d="M104,92 C98,62 114,40 150,38 C186,40 202,62 196,92 Q198,150 150,170 Q102,150 104,92 Z" fill="url(#sh${id})"/>
           ${seam("M150,40 Q152,110 150,170", .22)}
           <path d="M110,140 Q150,182 190,140" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="5" filter="url(#b${id})"/>
           ${sans(150, 206, 7, c.ink, "BRAIN AT WORK LIFESTYLE", 'letter-spacing="2.2" opacity=".9"')}`
        : `<path d="M116,94 Q132,120 150,124 Q168,120 184,94" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2.2"/>
           <path d="M117,97 Q133,122 150,126" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="1"/>
           <path d="M138,118 Q135,150 137,184" fill="none" stroke="${c.string}" stroke-width="2.6" stroke-linecap="round"/>
           <path d="M162,118 Q165,150 163,184" fill="none" stroke="${c.string}" stroke-width="2.6" stroke-linecap="round"/>
           <rect x="134.6" y="182" width="5" height="11" rx="1.6" fill="#c9c9c9"/><rect x="160.4" y="182" width="5" height="11" rx="1.6" fill="#c9c9c9"/>
           <circle cx="138" cy="117" r="2.6" fill="#bdbdbd"/><circle cx="162" cy="117" r="2.6" fill="#bdbdbd"/>
           <image href="images/brand/logo-white.png" x="104" y="146" width="92" height="100" preserveAspectRatio="xMidYMid meet" opacity=".96"/>
           <path d="M98,266 L202,266 L216,336 L84,336 Z" fill="rgba(0,0,0,.06)"/>
           ${seam("M98,266 L202,266", .3)}${seam("M84,336 L98,266", .3)}${seam("M216,336 L202,266", .3)}
           <path d="M98,266 Q92,300 84,336" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2.4"/>
           <path d="M202,266 Q208,300 216,336" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2.4"/>`}
      ${softFolds(id, ["M236,176 Q246,240 244,312", "M64,176 Q54,240 56,312", "M96,250 Q104,296 94,338", "M206,250 Q198,296 208,338", "M232,140 Q240,150 250,150"], .09)}
      <path d="${body}" fill="url(#hl${id})"/>
      ${shade(body, id)}
      ${back ? "" : `<path d="M150 112 V32 C150 24 160 22 160 12.5 C160 5.5 155.5 2 150 2 C144.5 2 141 5.5 141 10" fill="none" stroke="url(#m${id})" stroke-width="2.6" stroke-linecap="round"/>`}
      ${back ? hook(id, 40) : ""}`;
  }

  // fitted mock-neck rib tank
  const MOCK_TANK = `M122,50 L178,50 L180,64 L196,64 Q200,104 224,122 L226,332 Q150,338 74,332 L76,122 Q100,104 104,64 L120,64 Z`;

  function tank(c, side, id) {
    const back = side === "back";
    const d = MOCK_TANK;
    const strap = (x, y, r) => `<text transform="translate(${x},${y}) rotate(${r})" font-family="Inter, Arial" font-weight="800" font-style="italic" font-size="5.2" fill="${c.ink}" letter-spacing="1.2">BAWL</text>`;
    return `
      <defs>${tintDefs(id, c.ink)}</defs>
      ${shoulderHanger(id)}
      <path d="${d}" fill="${c.b}"/>
      <path d="${d}" fill="#000" filter="url(#n${id})"/>
      ${Array.from({ length: 34 }, (_, i) => seam(`M${78 + i * 4.3},124 L${78 + i * 4.3},330`, 0.04)).join("")}
      <path d="M122,50 L178,50 L180,66 Q150,72 120,66 Z" fill="${c.alt}"/>
      ${Array.from({ length: 13 }, (_, i) => seam(`M${124 + i * 4.4},51 L${124 + i * 4.4},67`, 0.08)).join("")}
      ${back
        ? `${sans(150, 84, 5.5, c.ink, "BAWL", 'letter-spacing="1.5"')}
           ${strap(110, 74, 76)}${strap(193, 98, -76)}`
        : `${printImg(id, "images/products/print-tank-bawl.png", 120, 134, 60, 12)}
           ${sans(150, 82, 5, c.ink, "BAWL", 'letter-spacing="1.2" font-style="italic" font-weight="800"')}
           ${strap(110, 74, 76)}${strap(193, 98, -76)}${strap(95, 100, 62)}${strap(213, 122, -62)}`}
      ${softFolds(id, ["M108,170 Q114,250 104,326", "M192,170 Q186,250 196,326"], .05)}
      ${shade(d, id)}`;
  }

  function jacket(c, side, id) {
    const back = side === "back";
    const d = LONG_SLEEVE(back ? 62 : 74);
    const script = `font-family="'Permanent Marker', 'Brush Script MT', cursive" fill="${c.ink}" text-anchor="middle"`;
    return `
      <path d="M118,56 Q150,48 182,56 L182,64 Q150,58 118,64 Z" fill="${c.alt}"/>
      ${shoulderHanger(id)}
      <path d="${d}" fill="${c.b}"/>
      <path d="M234,272 L264,268 L264,280 L234,284 Z" fill="${c.alt}"/>
      <path d="M66,272 L36,268 L36,280 L66,284 Z" fill="${c.alt}"/>
      <path d="M82,312 Q150,318 218,312 L218,326 Q150,332 82,326 Z" fill="${c.alt}"/>
      <circle cx="96" cy="319" r="2.6" fill="#b9b9b9"/><circle cx="204" cy="319" r="2.6" fill="#b9b9b9"/>
      ${seam("M216,68 Q222,110 222,150", .14)}${seam("M84,68 Q78,110 78,150", .14)}
      ${back
        ? `<path d="M112,54 Q150,44 188,54 L192,76 Q150,66 108,76 Z" fill="${c.b}"/>
           <path d="M112,54 Q150,44 188,54 L192,76 Q150,66 108,76 Z" fill="rgba(0,0,0,.18)"/>
           ${seam("M84,100 Q150,108 216,100", .18)}
           <text x="152" y="148" font-size="27" ${script} transform="rotate(-6 150 140)">BAWL</text>
           <path d="M98,160 Q150,144 206,160 Q150,178 98,160 Z" fill="#f1efea"/>
           <path d="M118,160 Q131,151 144,160 Q131,167 118,160 Z" fill="#fff" stroke="#1a1a1a" stroke-width=".9"/>
           <path d="M158,160 Q171,151 184,160 Q171,167 158,160 Z" fill="#fff" stroke="#1a1a1a" stroke-width=".9"/>
           <circle cx="131" cy="159.5" r="3.4" fill="#1a1a1a"/><circle cx="171" cy="159.5" r="3.4" fill="#1a1a1a"/>
           <path d="M98,160 L88,162 M206,160 L216,158" stroke="#f1efea" stroke-width="2" stroke-linecap="round"/>
           <text x="150" y="196" font-family="'Instrument Serif', Georgia, serif" font-size="17" fill="#f1efea" text-anchor="middle" letter-spacing=".5">NOW YOU <tspan fill="${c.ink}">SEE</tspan> ME</text>
           <text x="150" y="208" font-family="'Instrument Serif', Georgia, serif" font-size="7.5" fill="#f1efea" text-anchor="middle" letter-spacing="1">BUT <tspan fill="${c.ink}">SOMETIMES</tspan> I DON'T</text>`
        : `<line x1="150" y1="78" x2="150" y2="326" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>
           ${[112, 152, 192, 232, 272].map((y) => `<circle cx="150" cy="${y}" r="3.2" fill="#c2c2c2" stroke="rgba(0,0,0,.35)" stroke-width=".8"/>`).join("")}
           <path d="M100,124 H134 V134 L117,138 L100,134 Z" fill="${c.alt}"/>
           <path d="M166,124 H200 V134 L183,138 L166,134 Z" fill="${c.alt}"/>
           ${seam("M100,124 V162 H134 V124", .2)}${seam("M166,124 V162 H200 V124", .2)}
           <text x="183" y="156" font-size="10" ${script} transform="rotate(-6 183 152)">BAWL</text>
           <path d="M118,55 L150,82 L134,110 L100,72 Z" fill="${c.b}"/>
           <path d="M182,55 L150,82 L166,110 L200,72 Z" fill="${c.b}"/>
           <path d="M118,55 L150,82 L134,110 L100,72 Z" fill="rgba(255,255,255,.06)" stroke="rgba(0,0,0,.25)" stroke-width=".8"/>
           <path d="M182,55 L150,82 L166,110 L200,72 Z" fill="rgba(0,0,0,.12)" stroke="rgba(0,0,0,.25)" stroke-width=".8"/>`}
      ${shade(d, id, c.gloss)}`;
  }

  /* ---------- photo garments ---------- */
  function photoTop(p, src, id) {
    const w = p.w || 262, y = p.y || 40;
    const h = p.size ? (w * p.size[1]) / p.size[0] : 380 - y;
    return `${p.noHanger ? "" : shoulderHanger(id, p.hw || 78)}
      <image href="${src}" x="${150 - w / 2}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMin meet"/>
      ${p.hookOnTop ? `${hook(id, p.hookOnTop)}` : ""}`;
  }
  function photoBottom(p, src, id) {
    const h = p.h || 318;
    const w = p.size ? (h * p.size[0]) / p.size[1] : 220;
    const x = 150 - w / 2, wl = p.waist || [0.2, 0.8];
    const c1 = x + w * wl[0] + 9, c2 = x + w * wl[1] - 9;
    return `${clipHangerBack(id)}
      <image href="${src}" x="${x}" y="58" width="${w}" height="${h}" preserveAspectRatio="xMidYMin meet"/>
      ${clip(c1, id)}${clip(c2, id)}`;
  }
  function photoHook(p, src, id) {
    const w = p.w || 220;
    const h = p.size ? (w * p.size[1]) / p.size[0] : 200;
    return `${hook(id, 40)}
      <path d="M150 40 C150 50 150 52 150 58" stroke="url(#m${id})" stroke-width="2.6" fill="none"/>
      <circle cx="150" cy="62" r="5" fill="none" stroke="url(#m${id})" stroke-width="2.2"/>
      <image href="${src}" x="${150 - w / 2}" y="64" width="${w}" height="${h}" preserveAspectRatio="xMidYMin meet"/>`;
  }

  const DRAW = { tee, tank, jacket, hoodie };

  window.garmentSVG = function (product, color, side = "front") {
    const id = "g" + ++uid;
    const src = side === "back" && color.back ? color.back : color.photo;
    let body;
    if (product.type === "photo-top") body = photoTop(product, src, id);
    else if (product.type === "photo-bottom") body = photoBottom(product, src, id);
    else if (product.type === "photo-hook") body = photoHook(product, src, id);
    else body = (DRAW[product.type] || tee)(color, side, id);
    return `<svg class="garment-svg" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" role="img"
      aria-label="${product.name} in ${color.n}, ${side} view"><defs>${metalDefs(id)}${fabricDefs(id, color.gloss)}</defs>${body}</svg>`;
  };

  window.hasBackView = (product, color) => (product.type.startsWith("photo") ? !!(color && color.back) : product.type !== "card");
})();
