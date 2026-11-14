# After Office Hours — Character Archive

Zero-dependency character archive for desktop and mobile browsers.

## Run

```bash
python -m http.server 8080
```

Open `http://localhost:8080` (ES modules need HTTP, not `file://`).

## Flow

Intro → orbital archive → dossier.

- Drag / swipe / wheel / ← → to rotate
- Tap a side card to bring it forward; tap the front card to open
- Esc / outside click / × to close the dossier

## Edit characters

1. Edit [`js/data/characters.js`](js/data/characters.js) — names, roles, stats, description, optional `note`.
2. Drop `assets/images/{name}.webp` (lowercase RGBA cutout, ~640×853).

Idle cards use CSS `brightness(0)` on the WebP alpha — no separate silhouette files.

Stats use `—` until filled. Empty `description` / `note` hides those sections — add bios when ready.

## Assets

| File | Role |
|------|------|
| `assets/fonts/*.woff2` | Calora (inscriptions, names) + Gaibo (labels, numbers) |
| `assets/images/*.webp` | Character plates (RGBA) |
| `assets/images/introforoc.webp` | Intro poster |
| `assets/images/background.webp` | Archive atmosphere |
| `assets/favicon/favicon.ico` | Browser tab icon |
| `assets/favicon/apple-touch-icon.png` | Home-screen icon |

## Stack

Vanilla HTML / CSS / JS modules. No npm runtime dependencies.

`js/archive.bundle.js` and `js/intro.bundle.js` are what the pages load; they mirror
`js/orbit.js`, `js/dossier.js`, `js/main.js` and `js/intro.js`. Edit both when changing behaviour.

## Navigation

Intro → orbital archive → dossier. The archive and the file cabinet link to each other
through the plain text link in the top-right corner (Open files / Open stand).

## Design system — Reliquary

The poster's world, extended. All tokens in `css/tokens.css`.

- Palette: plaster `#e9e4dc`, ink `#1b1718`, statue crimson `#8a1430`, bruised violet `#3b2a5a`, ash `#9a918a`.
- Type: Calora (inscriptions, names) + Gaibo (labels, numbers). Long text uses the system serif.
  No external fonts or requests.
- The pen circle (`css/scribble.css`) marks "this one": front figure, pulled-out file, lore toggle, links.


Breakpoints (CSS media queries + orbit JS via tokens): **600** / **900**.
