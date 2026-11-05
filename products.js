/* =============================================================
   BAWL — shop settings + product catalogue
   Everything a shop owner needs to edit lives in this file.
   ============================================================= */

window.BAWL_CONFIG = {
  /* ---- How orders reach you -------------------------------------------
     paystackPublicKey : Paystack PUBLIC key (pk_live_… / pk_test_…) → card, transfer & USSD at checkout
     whatsappNumber    : international format without "+", e.g. "2348012345678" → every order lands here
     bank              : shown to customers who choose "Bank transfer"
     With no WhatsApp number, orders go to the Instagram DM instead.        */
  paystackPublicKey: "",
  whatsappNumber: "",
  instagram: "_b.a.w.l",
  bank: { bankName: "", accountName: "", accountNumber: "" },

  delivery: [
    { id: "lagos",  label: "Lagos delivery",      note: "1–3 working days", price: 5000 },
    { id: "nation", label: "Nationwide delivery", note: "3–7 working days", price: 8000 },
    { id: "pickup", label: "Pickup in Lagos",     note: "We'll send the address", price: 0 }
  ],

  /* ---- Event banner (from the @_b.a.w.l pop-up post) ---- */
  event: {
    title: "The BAWL Experience",
    kicker: "First-ever pop-up · 3 years of BAWL",
    start: "2026-11-29T14:00:00+01:00",
    end: "2026-11-29T22:00:00+01:00",
    venue: "Deeonis Football Court",
    area: "Ota Ona, Ikorodu, Lagos",
    blurb: "Come shop, vibe and celebrate in real life. Merch launch, music and new designs. Limited pieces only."
  }
};

/*
  cat    : tops | bottoms | outerwear | accessories
  type   : photo-top    → photo on a shoulder hanger
           photo-bottom → photo on a clip hanger      (waist = clip positions as 0–1 of image width)
           photo-hook   → photo hanging from a hook   (caps, beanies, bags)
           tee | tank   → drawn garment using the real print artwork
           card         → photo only, not on the rack (socks)
  size   : [width, height] of the cut-out PNG (used to hang it correctly)
  colors : photo = front cut-out, back = optional back-view cut-out
  PRICES ARE PLACEHOLDERS — confirm with BAWL before going live.
*/
const P = "images/products/", L = "images/look/", I = "images/ig/";

window.BAWL_PRODUCTS = [
  /* ---------------- DREAMS ARE MADE HERE ---------------- */
  {
    id: "bawl-27-vest", name: "BAWL 27 Vest",
    cat: "tops", type: "photo-top", w: 214, y: 30, size: [334, 533], price: 26000, isNew: true,
    tag: "Jersey or rib knit · Sleeveless",
    desc: "‘Gang of Broke Kids’ BAWL 27 vest with gothic lettering up front and a big 27 across the back. In black jersey with white piping, or cream rib knit.",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { n: "Black Jersey", b: "#141414", photo: P + "vest-black-front.png", back: P + "vest-black-back.png" },
      { n: "Cream Knit", b: "#efe6cf", photo: P + "vest-cream-front.png" }
    ],
    gallery: [I + "pa-2.jpg"]
  },

  /* ---------------- CORE ---------------- */
  {
    id: "shadow-plaid-overshirt", name: "Shadow Plaid Zip Overshirt",
    cat: "tops", type: "photo-top", w: 262, size: [615, 427], price: 45000,
    tag: "Brushed plaid · Boxy fit",
    desc: "Soft brushed plaid in shaded green with a full zip front, point collar and patch chest pocket. Embroidered BAWL crest on the chest and red BAWL tabs on both cuffs.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ n: "Forest", b: "#4f7a5c", photo: P + "overshirt-green.png" }],
    gallery: [I + "flannel-jeans-hi.jpg"]
  },
  {
    id: "portrait-tee", name: "BAWL Portrait Tee",
    cat: "tops", type: "photo-top", w: 236, size: [413, 322], price: 28000,
    tag: "Heavyweight cotton · Oversized",
    desc: "Oversized heavyweight tee with a full-front portrait print and the BAWL wordmark in red across the eyes.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ n: "Black", b: "#141414", photo: P + "portrait-tee-black.png" }],
    gallery: [I + "tee-sweats.jpg", I + "community-wall.jpg"]
  },
  {
    id: "rent-is-due-tee", name: "Rent Is Due Everyday Tee",
    cat: "tops", type: "tee", price: 25000,
    tag: "Heavyweight cotton · Boxy fit",
    desc: "A reminder that the work never stops. Boxy heavyweight tee with the ‘Rent Is Due Everyday’ statement across the chest.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { n: "White / Cobalt", b: "#f3f2ee", ink: "#3a56c4", alt: "#e2e0da" },
      { n: "Black / Butter", b: "#161616", ink: "#f2df84", alt: "#2a2a2a" }
    ],
    gallery: [I + "rent-group.jpg", I + "rent-white.jpg", I + "rent-black.jpg"]
  },
  {
    id: "rib-tank", name: "BAWL Rib Tank",
    cat: "tops", type: "tank", price: 18000,
    tag: "Stretch rib · Fitted mock neck",
    desc: "Fitted mock-neck rib tank with the BAWL wordmark on the chest and repeat BAWL taping along both shoulders.",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { n: "White", b: "#f3f2ee", ink: "#141414", alt: "#e2e0da" },
      { n: "Black", b: "#141414", ink: "#f3f2ee", alt: "#262626" }
    ],
    gallery: [L + "tank-c3.jpg", L + "tank-c2.jpg", L + "tank-c5.jpg"]
  },
  {
    id: "now-you-see-me-jacket", name: "Now You See Me Jacket",
    cat: "outerwear", type: "photo-top", w: 250, y: 24, size: [548, 723], price: 85000,
    tag: "Work jacket · Relaxed fit · Shown from the back",
    desc: "Structured work jacket with a wide collar, snap hem tabs and the ‘Now You See Me — But Sometimes I Don't’ eyes print across the back. Olive twill or black faux leather.",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { n: "Olive", b: "#5d5f3e", photo: P + "jacket-olive-back.png" },
      { n: "Black Leather", b: "#141414", photo: P + "jacket-black-back.png" }
    ],
    gallery: [L + "jacket-c5.jpg", L + "jacket-c4.jpg", L + "jacket-c3.jpg", L + "jacket-c1.jpg"]
  },

  /* ---------------- BOTTOMS ---------------- */
  {
    id: "curve-denim", name: "Curve Denim Jeans",
    cat: "bottoms", type: "photo-bottom", h: 318, waist: [.27, .76], size: [439, 802], price: 48000,
    tag: "Raw indigo denim · Barrel leg",
    desc: "Wide barrel-leg jeans in deep indigo with contrast white stitching, curved seams and an embroidered crest on the front pocket. Red BAWL marks at both hems.",
    sizes: ["28", "30", "32", "34", "36"],
    colors: [{ n: "Indigo", b: "#1f2638", photo: P + "jeans-indigo.png" }],
    gallery: [I + "flannel-jeans-hi.jpg"]
  },
  {
    id: "side-tape-trousers", name: "Side-Tape Trousers",
    cat: "bottoms", type: "photo-bottom", h: 318, waist: [.14, .86], size: [335, 669], price: 40000, isNew: true,
    tag: "Twill · Straight wide leg",
    desc: "Straight wide-leg trousers with a pressed crease and white BAWL tape running down both sides.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ n: "Black", b: "#121212", photo: P + "trousers-tape-black.png" }],
    gallery: [I + "pa-2.jpg"]
  },
  {
    id: "utility-trousers", name: "Utility Pocket Trousers",
    cat: "bottoms", type: "photo-bottom", h: 318, waist: [.12, .88], size: [292, 668], price: 42000, isNew: true,
    tag: "Twill · Wide leg",
    desc: "High-waisted wide-leg trousers with buttoned flap cargo pockets and a small BAWL mark at the hip.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ n: "Black", b: "#121212", photo: P + "trousers-utility-black.png" }],
    gallery: [I + "pa-2.jpg"]
  },
  {
    id: "flame-pants", name: "Flame Wide-Leg Pants",
    cat: "bottoms", type: "photo-bottom", h: 318, waist: [.08, .92], size: [314, 497], price: 42000,
    tag: "Cotton twill · Wide leg",
    desc: "Black wide-leg pants with a large BAWL wordmark at the hip and white tribal flame graphics running up both legs.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ n: "Black", b: "#121212", photo: P + "flame-pants-black.png" }],
    gallery: [I + "tee-sweats.jpg"]
  },
  {
    id: "denim-shorts", name: "BAWL Denim Shorts",
    cat: "bottoms", type: "photo-bottom", h: 250, waist: [.22, .78], size: [517, 665], price: 30000, isNew: true,
    tag: "Indigo denim · Long, raw hem",
    desc: "Long, loose denim shorts with a raw frayed hem and BAWL in outline lettering down the leg.",
    sizes: ["28", "30", "32", "34", "36"],
    colors: [{ n: "Indigo", b: "#1d2433", photo: P + "shorts-denim.png" }],
    gallery: [L + "pb-6.jpg", L + "pb-4.jpg", L + "pa-1.jpg"]
  },
  {
    id: "cord-shorts", name: "Belted Cord Shorts",
    cat: "bottoms", type: "photo-bottom", h: 230, waist: [.3, .96], size: [421, 569], price: 30000, isNew: true,
    tag: "Corduroy · Pleated, turn-up hem",
    desc: "Pleated brown corduroy shorts with a turned-up hem, leather belt and BAWL outline lettering down the leg.",
    sizes: ["28", "30", "32", "34", "36"],
    colors: [{ n: "Chocolate", b: "#5a3622", photo: P + "shorts-cord-brown.png" }],
    gallery: [L + "pa-4.jpg"]
  },

  /* ---------------- ACCESSORIES ---------------- */
  {
    id: "logo-beanie", name: "Brain Crest Beanie",
    cat: "accessories", type: "photo-hook", w: 200, size: [375, 311], price: 12000,
    tag: "Rib knit · Turn-up cuff",
    desc: "Chunky rib-knit beanie with a turn-up cuff and the woven BAWL brain crest label.",
    sizes: ["One size"],
    colors: [{ n: "Black", b: "#151515", photo: P + "beanie-black.png" }],
    gallery: [L + "pb-2.jpg", I + "beanies.jpg", L + "tank-c5.jpg"]
  },
  {
    id: "crossbody-bag", name: "Crest Crossbody Bag",
    cat: "accessories", type: "photo-hook", w: 236, size: [468, 454], price: 35000, isNew: true,
    tag: "Pebbled leather · Adjustable strap",
    desc: "Compact pebbled-leather crossbody with a flap front, embossed BAWL crest and adjustable strap.",
    sizes: ["One size"],
    colors: [{ n: "Tan", b: "#a8673d", photo: P + "bag-tan.png" }],
    gallery: [L + "pb-6.jpg", L + "pb-4.jpg"]
  },
  {
    id: "crew-socks", name: "BAWL Crew Socks",
    cat: "accessories", type: "card", price: 6000, isNew: true,
    tag: "Cushioned cotton · Crew length",
    desc: "Cushioned white crew socks with the red BAWL wordmark down the side.",
    sizes: ["One size"],
    colors: [{ n: "White / Red", b: "#f4f3ef", photo: L + "pb-5.jpg" }],
    cardImg: L + "pb-5.jpg", cardAlt: L + "pb-1.jpg",
    gallery: [L + "pb-1.jpg", L + "pb-3.jpg", L + "pb-5.jpg"]
  }
];
