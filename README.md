# BAWL — Brain At Work Lifestyle

Concept website for **BAWL** (@_b.a.w.l): a live "fitting room" rack where shoppers swing and
switch between real pieces on hangers, plus shop, lookbook, pop-up countdown and checkout.

Plain HTML/CSS/JavaScript: no build step, no dependencies.

## Host it on GitHub Pages

1. Create a new repository on GitHub (e.g. `bawl-site`), public.
2. Click **Add file → Upload files** and drag in **everything inside this folder**
   (`index.html`, the `.js`/`.css` files, the `images` folder, `.nojekyll`). Commit.
   `index.html` must be at the top level of the repo, not inside another folder.
3. Go to **Settings → Pages**. Under *Build and deployment* choose
   **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. After a minute the site is live at https://lakesolve-cloud.github.io/bawl-lifestyle/

## Preview on your computer

Open a terminal in this folder and run:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Editing

Everything a shop owner changes lives in **`products.js`**:

- `BAWL_CONFIG.whatsappNumber`: orders are sent here (format `2348012345678`).
  Until it's set, orders go to the Instagram DM.
- `BAWL_CONFIG.paystackPublicKey`: turns on card, transfer and USSD payments at checkout.
- `BAWL_CONFIG.bank`: account details shown for bank transfer.
- `BAWL_CONFIG.delivery` and `BAWL_CONFIG.event`: delivery prices, pop-up details.
- `BAWL_PRODUCTS`: names, **prices (currently placeholders)**, sizes, colours, photos.

After editing, bump the `?v=` number on the script and style links in `index.html`
so visitors' browsers load the new version.

## Notes

- Product photos and lifestyle images come from BAWL's Instagram and belong to BAWL.
- The "Top members" email sign-up is front-end only: it isn't connected to a mailing list yet.
