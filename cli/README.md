# resume-to-pdf

A small Node CLI that renders resume JSON to a PDF using headless Chrome.

It opens the resume site, injects your JSON exactly the way the in-page
`jsondebug` tool does (stashes it in `sessionStorage` and reloads so it renders
through the normal `populateResume()` path in `script.js`), then prints the page
to a PDF — honouring the site's `@page { size: A4 }` print styles.

## Setup

```bash
npm install   # installs puppeteer (bundles a Chromium)
```

## Install globally

Install it as a system-wide `resume-to-pdf` command so you can run it from any
directory:

```bash
# From inside this repo — symlinks the local checkout (best for development,
# picks up your edits automatically):
npm link

# …or install a copy globally:
npm install -g .

# …or straight from the Git repo, without cloning:
npm install -g github:chakri68/resume
```

To remove it later: `npm unlink -g resume-to-pdf` (or `npm uninstall -g resume-to-pdf`).

Once installed, drop the `node cli/resume-to-pdf.js` prefix and just use
`resume-to-pdf`:

```bash
resume-to-pdf ./my-resume.json -o my-resume.pdf
```

## Usage

```bash
# From a file (writes resumes/backend.pdf next to it)
node cli/resume-to-pdf.js resumes/backend.json

# Or via the npm script
npm run pdf -- resumes/backend.json -o out.pdf

# Or, if installed globally
resume-to-pdf resumes/backend.json -o out.pdf

# Inline JSON
resume-to-pdf --json '{"personal":{...}, ...}'

# Piped from stdin
cat resumes/google.json | resume-to-pdf -

# Drive a local server instead of the live site
resume-to-pdf resumes/backend.json --url http://localhost:8080
```

## Options

| Option              | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `-o, --output`      | Output PDF path (default: `<input>.pdf` or `resume.pdf`) |
| `-u, --url`         | Site URL to drive (default: `https://resume.chakri.me`) |
| `--json <text>`     | Pass JSON inline instead of a file                     |
| `-m, --margin <css>`| Page margin, any CSS length (default: `1.2cm`; `0` for none) |
| `--no-headless`     | Show the browser window (for debugging)                |
| `--timeout <ms>`    | Navigation/render timeout (default: `30000`)           |
| `-h, --help`        | Show help                                              |

## How it works

The site has a hidden debug tool: type the password `jsondebug` anywhere on the
page to open a panel, paste resume JSON, and render it. Under the hood that just
stashes the JSON in `sessionStorage["debugResumeData"]` and reloads
(`script.js`). This CLI automates exactly that path with Puppeteer:

1. Launch headless Chrome and open the site (`--url`, default
   `https://resume.chakri.me`).
2. `JSON.parse`-validate your input, set `sessionStorage["debugResumeData"]`, and
   reload so the resume renders through the normal `populateResume()` flow.
3. Wait for the loading overlay to disappear, switch to print media, and export an
   A4 PDF.

### A note on margins

The site's print stylesheet leaves the `@page` margins commented out and prints
`body` with `margin/padding: 0` — Chrome's own print dialog normally fills in the
spacing. A headless export gets none of that, so the CLI applies an explicit
`1.2cm` margin (the value the stylesheet hints at) on all sides. Change it with
`--margin` (e.g. `--margin 2cm`, `--margin 0.5in`, or `--margin 0` for
edge-to-edge).

> **Note:** the live `resume.chakri.me` serves whatever is deployed. If you have
> unpushed changes to `script.js`/`styles.css`, run a local server and point the
> CLI at it with `--url http://localhost:<port>`.
