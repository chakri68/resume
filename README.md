# Resume

My resume, as a webpage. Plain HTML, CSS, and JS — no framework, no build step. The content lives in JSON, so I can keep one codebase and swap in a different data file depending on which flavor of me a given job wants to see (frontend, full-stack, whatever). It renders to screen, toggles dark/light, and prints to a clean A4 PDF.

## What it does

- Clean, responsive layout that reads fine on a phone
- Dark/light toggle
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

## Printing

Hit the print button (🖨️) in the nav, or just `Ctrl/Cmd + P`. It's tuned for A4.

## Generating a PDF from the CLI

Opening a browser and hitting print gets old. There's a Node CLI in [`cli/`](cli/README.md) that turns a resume JSON into a PDF for you. It drives headless Chrome, injects your JSON the same way the in-page `jsondebug` tool does (through `sessionStorage` — see `script.js`), and prints the page using the site's A4 print styles. So the PDF is byte-for-byte what you'd get hitting print yourself, minus the clicking.

```bash
npm install                                # pulls puppeteer (bundles Chromium)

node cli/resume-to-pdf.js resumes/backend.json -o backend.pdf
npm run pdf -- resumes/backend.json        # same thing, via npm script
cat resumes/google.json | node cli/resume-to-pdf.js -   # or pipe it in
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
└── resumes/            # your data files (frontend.json, fullstack.json, …)
```

Adding a feature is the usual: markup in `index.html`, styles in `styles.css`, logic in `script.js`.

## Contributing

PRs welcome.

## Credits

- Font: [Source Sans Pro](https://fonts.google.com/specimen/Source+Sans+Pro)
- Icons: custom SVG and a few emoji
- me :)
