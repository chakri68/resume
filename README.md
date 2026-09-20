# Resume

My resume, as a webpage. Plain HTML, CSS, and JS — no framework, no build step. The content lives in JSON, so I can keep one codebase and swap in a different data file depending on which flavor of me a given job wants to see (frontend, full-stack, whatever). It renders to screen, toggles dark/light, and prints to a clean A4 PDF.

## What it does

- Clean, responsive layout that reads fine on a phone
- Dark/light toggle
- Six alternate designs behind a tiny picker, for when classy isn't the mood (see [Designs](#designs))
- Print-friendly — the on-screen version and the printed A4 are the same thing, styled differently
- Content is JSON, so editing your resume never means touching markup
- No dependencies to load, so it's quick
- Reasonable SEO and accessibility

## Quick start

Clone it:

```bash
git clone https://github.com/chakri68/resume.git
cd resume
```

Pick a data file — `resumes/frontend.json`, `resumes/fullstack.json`, or roll your own following the same shape. Then open `index.html` in a browser and you're looking at your resume. You can find the schema at [`schema.json`](schema.json).

## Customizing it

### Personal info

Everything comes from the JSON. Contact block looks like this:

```json
{
  "personal": {
    "name": "YOUR NAME",
    "contact": {
      "github": {
        "text": "GitHub",
        "url": "your-github-url"
      },
      "linkedin": {
        "text": "LinkedIn",
        "url": "your-linkedin-url"
      },
      "email": {
        "text": "your-email@example.com",
        "url": "mailto:your-email@example.com"
      },
      "phone": {
        "text": "your-phone",
        "url": "tel:your-phone"
      }
    }
  }
}
```

### Sections

The template renders these:

- Professional Summary
- Technical Skills
- Professional Experience
- Projects
- Education
- Achievements

All of them come from the JSON. The example files show the structure — copy one and edit.

### Styling

`styles.css` is where colors, fonts, and layout live. Default font is Source Sans Pro. Dark/light colors are CSS variables at the top, so you don't have to go hunting.

## Designs

The page you get by default is the classic one. There's a design button in the top bar — 🎨, next to the theme toggle — that swaps the whole thing for something louder. Every design carries the same button in its own nav, dressed to match (the menu too: riso gets a pill with an offset shadow, dada gets a crooked black card, the almanac gets an errata slip):

| id | what it is |
| --- | --- |
| `classic` | the original. still the default |
| `riso` | two-ink risograph poster, shapes overprinted on the name |
| `magazine` | Bodoni masthead, three ruled columns, one highlighter |
| `broadsheet` | newspaper front page — jobs are stories, projects are classifieds |
| `broadside` | wood-type letterpress show poster, jobs billed as acts |
| `dada` | the name broken three ways, blocks a degree or two off true |
| `almanac` | 18th-century title page. "printed for the author" |

Your pick sticks (localStorage) and lands in the URL, so `?design=broadsheet` is a shareable link. It composes with the other params: `?resume=frontend&design=almanac`.

How it works, since it's the only non-obvious part of the repo:

- `designs/designs.js` runs in `<head>` and stamps `data-design` on `<html>` before first paint, so there's no flash of the wrong page. Everything else loads lazily — pick `dada` and only then do `designs/dada.js`, `designs/dada.css` and its fonts get fetched. The default page pays for none of it.
- Each design is a renderer (JSON in, HTML string out) mounted in a **shadow root**. That's deliberate: `styles.css` styles bare `section`, `article`, `h2`… and those would bleed straight into a design otherwise.
- **Motion is opt-out by construction.** Marquees, hero entrances and scroll reveals only arm when the visitor *hasn't* asked for reduced motion, and only fire once the loading screen is gone (otherwise every entrance plays behind it). A renderer opts elements into scroll reveal with `{ reveal: "<selector>" }` as the third argument to `define`; `h.marquee()` builds a seamless ticker, and `.dz-bleed` breaks a band out of the 1440px sheet to the viewport edges.
- **The tab follows along.** `favicon.svg` draws with CSS custom properties, so switching design re-inks the tab icon (paper tile, the design's ink, its accent rule) and sets `theme-color` to the design's paper. Classic gets the plain file back, which also has a dark-scheme variant baked in.
- **Classic prints to A4, designs print as themselves.** Classic's print is the one that goes to recruiters, so nothing about it changed: A4, one page, ATS reading order intact. Print from a design (`Ctrl+P`, or its own print button) and you get that design on a single page cut to its own size: 1440px wide, the sheet it's drawn for, and exactly as tall as it runs. No shrinking to fit A4, nothing split across pages. The height doesn't exist until it's laid out at 1440px and your window might be narrower, so `beforeprint` pins the sheet to 1440px, measures it, writes an `@page` rule, and turns motion off (unrevealed blocks would otherwise print blank). `afterprint` puts all of it back. The posters are for humans; the A4 is for parsers.

The designs read a few optional fields (all in [`schema.json`](schema.json)): `personal.tagline`, per-job `headline` / `deck` (the newspaper needs headlines), and a top-level `highlights` array for pull quotes. Leave them out and the designs fall back to sensible text or just skip the block — `resumes/backend.json` has the full set if you want an example.

Adding one: drop `designs/<id>.js` (call `ResumeDesigns.define("<id>", (data, h) => html, options)`) and `designs/<id>.css`, then add a line to the `DESIGNS` list at the top of `designs/designs.js`. Set the `--picker-*` variables in your CSS and the design menu follows suit.

## Icons and the link preview

`favicon.svg` and `scripts/og-card.html` are the sources; the PNGs are rendered from them, never drawn by hand:

```bash
npm run brand    # → og-image.png, icon-512.png, apple-touch-icon.png
```

The link-preview card is drawn as the top of the classic page — same logo, nav and type — since that's where a shared link lands. Crawlers don't run JS, so there's one card for the whole site regardless of `?design=`. Edit the copy in `scripts/og-card.html` when your headline changes.

## Printing

Hit the print button (🖨️) in the nav, or just `Ctrl/Cmd + P`. Classic is tuned for A4. A design prints on one page sized to the design (see [Designs](#designs)), which is great for sharing and questionable for your office printer.

## Generating a PDF from the CLI

Opening a browser and hitting print gets old. There's a Node CLI in [`cli/`](cli/README.md) that turns a resume JSON into a PDF for you. It drives headless Chrome, injects your JSON the same way the in-page `jsondebug` tool does (through `sessionStorage` — see `script.js`), and prints the page using the site's A4 print styles. So the PDF is byte-for-byte what you'd get hitting print yourself, minus the clicking.

```bash
npm install                                # pulls puppeteer (bundles Chromium)

node cli/resume-to-pdf.js resumes/backend.json -o backend.pdf
npm run pdf -- resumes/backend.json        # same thing, via npm script
cat resumes/google.json | node cli/resume-to-pdf.js -   # or pipe it in
node cli/resume-to-pdf.js resumes/backend.json -d broadsheet   # a design instead → backend-broadsheet.pdf
```

By default it renders against the live site (`https://resume.chakri.me`). Point it at a local server with `--url http://localhost:<port>` if you want to see changes you haven't pushed yet.

### Install it globally

If you want a `resume-to-pdf` command that works from anywhere:

```bash
npm link            # symlinks this checkout, so it picks up your edits …
npm install -g .    # … or install a frozen copy
```

Then:

```bash
resume-to-pdf ./my-resume.json -o my-resume.pdf
```

Full options are in [`cli/README.md`](cli/README.md).

## Project structure

```
resume/
├── index.html          # markup
├── styles.css          # styles (screen + print)
├── script.js           # rendering + JSON injection
├── designs/            # alternate designs: loader + picker, then one .js/.css pair each
└── resumes/            # your data files (frontend.json, fullstack.json, …)
```

Adding a feature is the usual: markup in `index.html`, styles in `styles.css`, logic in `script.js`.

## Contributing

PRs welcome.

## Credits

- Font: [Source Sans Pro](https://fonts.google.com/specimen/Source+Sans+Pro)
- Icons: custom SVG and a few emoji
- me :)
