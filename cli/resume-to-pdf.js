#!/usr/bin/env node
"use strict";

/**
 * resume-to-pdf — render resume JSON to a PDF via headless Chrome.
 *
 * It opens the resume site (https://resume.chakri.me by default), injects the
 * JSON the same way the in-page "jsondebug" tool does — by stashing it in
 * sessionStorage under DEBUG_STORAGE_KEY and reloading so it renders through the
 * normal populateResume() path (see script.js) — then prints the page to PDF.
 *
 * Usage:
 *   node cli/resume-to-pdf.js <input.json> [options]
 *   node cli/resume-to-pdf.js --json '{"personal":...}' [options]
 *   cat resume.json | node cli/resume-to-pdf.js - [options]
 *
 * Options:
 *   -o, --output <file>   Output PDF path (default: <input>.pdf or resume.pdf)
 *   -u, --url <url>       Site URL to drive (default: https://resume.chakri.me)
 *       --json <text>     Pass JSON inline instead of a file
 *   -d, --design <id>     Print an alternate design (riso, broadsheet, …) instead of
 *                         classic: one page, sized to the design, not A4
 *   -m, --margin <css>    Page margin, any CSS length (default: 1.2cm; 0 for none)
 *       --no-headless     Show the browser window (handy for debugging)
 *       --timeout <ms>    Navigation/render timeout (default: 30000)
 *   -h, --help            Show this help
 */

const fs = require("fs");
const path = require("path");

// Must match script.js. The debug tool reads JSON from this sessionStorage key
// and renders it instead of fetching a resumes/*.json file.
const DEBUG_STORAGE_KEY = "debugResumeData";
const DEFAULT_URL = "https://resume.chakri.me";
// The site's print @page rule leaves margins commented out (and prints body with
// margin/padding 0), so Chrome's own print dialog supplies the spacing. Headless
// PDF export gets none of that, so we apply the margin the stylesheet hints at
// (styles.css: `margin: 1.2cm 1.2cm 1.2cm`). Override with --margin.
const DEFAULT_MARGIN = "1.2cm";

function parseArgs(argv) {
  const opts = {
    input: null,
    inlineJson: null,
    output: null,
    url: DEFAULT_URL,
    design: null,
    headless: true,
    timeout: 30000,
    margin: DEFAULT_MARGIN,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "-h":
      case "--help":
        opts.help = true;
        break;
      case "-o":
      case "--output":
        opts.output = argv[++i];
        break;
      case "-u":
      case "--url":
        opts.url = argv[++i];
        break;
      case "--json":
        opts.inlineJson = argv[++i];
        break;
      case "-d":
      case "--design":
        opts.design = argv[++i];
        break;
      case "--no-headless":
        opts.headless = false;
        break;
      case "--timeout":
        opts.timeout = parseInt(argv[++i], 10);
        break;
      case "-m":
      case "--margin":
        opts.margin = argv[++i];
        break;
      default:
        if (arg.startsWith("-") && arg !== "-") {
          fail(`Unknown option: ${arg}`);
        } else if (opts.input === null) {
          opts.input = arg;
        } else {
          fail(`Unexpected extra argument: ${arg}`);
        }
    }
  }
  return opts;
}

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

function printHelp() {
  console.log(
    `resume-to-pdf — render resume JSON to a PDF via headless Chrome

Usage:
  node cli/resume-to-pdf.js <input.json> [options]
  node cli/resume-to-pdf.js --json '{"personal":...}' [options]
  cat resume.json | node cli/resume-to-pdf.js - [options]

Options:
  -o, --output <file>   Output PDF path (default: <input>.pdf or resume.pdf)
  -u, --url <url>       Site URL to drive (default: ${DEFAULT_URL})
      --json <text>     Pass JSON inline instead of a file
  -d, --design <id>     Print an alternate design (riso, broadsheet, …) instead of
                        classic: one page, sized to the design, not A4
  -m, --margin <css>    Page margin, any CSS length (default: ${DEFAULT_MARGIN}; use 0 for none;
                        classic only)
      --no-headless     Show the browser window (handy for debugging)
      --timeout <ms>    Navigation/render timeout (default: 30000)
  -h, --help            Show this help`
  );
}

function readStdin() {
  return fs.readFileSync(0, "utf8");
}

function loadJson(opts) {
  let raw;
  let sourceLabel;

  if (opts.inlineJson !== null) {
    raw = opts.inlineJson;
    sourceLabel = "--json";
  } else if (opts.input === "-") {
    raw = readStdin();
    sourceLabel = "stdin";
  } else if (opts.input) {
    if (!fs.existsSync(opts.input)) fail(`Input file not found: ${opts.input}`);
    raw = fs.readFileSync(opts.input, "utf8");
    sourceLabel = opts.input;
  } else {
    fail("No input. Pass a JSON file, --json <text>, or pipe via stdin (use -).");
  }

  // Validate before launching a browser so failures are fast and obvious.
  try {
    JSON.parse(raw);
  } catch (err) {
    fail(`Invalid JSON from ${sourceLabel}: ${err.message}`);
  }
  return raw;
}

function resolveOutput(opts) {
  if (opts.output) return path.resolve(opts.output);
  // A design gets its own file, so it never lands on top of the classic PDF.
  const suffix = opts.design ? `-${opts.design}` : "";
  if (opts.input && opts.input !== "-") {
    const parsed = path.parse(path.resolve(opts.input));
    return path.join(parsed.dir, `${parsed.name}${suffix}.pdf`);
  }
  return path.resolve(`resume${suffix}.pdf`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    return;
  }

  const json = loadJson(opts);
  const output = resolveOutput(opts);

  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch {
    fail(
      "puppeteer is not installed. Run `npm install` in the repo root first."
    );
  }

  console.error(`→ Launching headless Chrome…`);
  const browser = await puppeteer.launch({
    headless: opts.headless ? "new" : false,
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(opts.timeout);
    // Designs animate in once the loading screen goes; a PDF should never catch one
    // halfway. Asking for reduced motion means the entrances are never armed at all.
    if (opts.design) {
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    }

    console.error(`→ Opening ${opts.url}`);
    await page.goto(opts.url, { waitUntil: "domcontentloaded" });

    // Replicate the "jsondebug" tool: stash the JSON in sessionStorage and
    // reload so it renders through the site's normal populateResume() path.
    // A design is picked the way a shared link picks one: ?design=<id>.
    console.error(`→ Injecting JSON and re-rendering…`);
    await page.evaluate(
      (key, value) => sessionStorage.setItem(key, value),
      DEBUG_STORAGE_KEY,
      json
    );
    if (opts.design) {
      const url = new URL(page.url());
      url.searchParams.set("design", opts.design);
      await page.goto(url.href, { waitUntil: "networkidle0" });
    } else {
      await page.reload({ waitUntil: "networkidle0" });
    }

    // Wait until the loading overlay is gone and the resume actually rendered.
    await page.waitForFunction(
      () => {
        const loading = document.querySelector(".loading-screen");
        const name = document.querySelector(".name");
        return !loading && name && name.textContent.trim().length > 0;
      },
      { timeout: opts.timeout }
    );

    if (opts.design) {
      await printDesign(page, opts, output);
      console.error(`✓ Saved ${output}`);
      return;
    }

    console.error(`→ Printing to PDF…`);
    await page.emulateMediaType("print");
    // NB: don't use preferCSSPageSize here — the site's @page rule has no margins
    // (Chrome's print dialog normally supplies them), so we'd get an edge-to-edge
    // PDF. Pin A4 + an explicit margin instead.
    await page.pdf({
      path: output,
      printBackground: true,
      format: "A4",
      margin: {
        top: opts.margin,
        right: opts.margin,
        bottom: opts.margin,
        left: opts.margin,
      },
    });

    console.error(`✓ Saved ${output}`);
  } finally {
    await browser.close();
  }
}

// A design sizes its own page: on beforeprint, designs/designs.js lays the sheet out at
// 1440px, measures it, and writes an `@page { size: 1440px <height>px }` rule. So the
// PDF just follows the page's CSS size here, instead of pinning A4 like classic does.
async function printDesign(page, opts, output) {
  // An unknown id, or a design that failed to load, quietly falls back to classic on
  // the site. Here that would be a classic PDF under a design's filename, so refuse.
  const state = await page.waitForFunction(
    (id) => {
      const html = document.documentElement;
      if (html.dataset.design !== id) {
        return { ok: false, known: window.ResumeDesigns ? window.ResumeDesigns.list() : [] };
      }
      const root = document.getElementById("design-root");
      const sheet = root && root.shadowRoot && root.shadowRoot.querySelector(".dz");
      return sheet ? { ok: true } : false;
    },
    { timeout: opts.timeout },
    opts.design
  );
  const { ok, known } = await state.jsonValue();
  if (!ok) {
    const others = known.filter((id) => id !== "classic").join(", ");
    throw new Error(`"${opts.design}" isn't a design. Try one of: ${others}`);
  }
  await page.evaluate(() => document.fonts.ready);

  console.error(`→ Printing the ${opts.design} design to PDF…`);
  // Chrome fires beforeprint for page.pdf() too; firing it first makes the order
  // explicit (designs.js ignores the second one) and lets us check the page answered.
  // A site deployed before design printing existed never writes the @page rule, and
  // would hand back classic again.
  const sized = await page.evaluate(() => {
    window.dispatchEvent(new Event("beforeprint"));
    return [...document.head.querySelectorAll("style")].some((s) => /@page\s*{\s*size:\s*\d+px/.test(s.textContent));
  });
  if (!sized) {
    throw new Error(`${opts.url} can't print designs yet (not deployed?). Point --url at a local server.`);
  }
  await page.pdf({
    path: output,
    printBackground: true,
    preferCSSPageSize: true,
  });
}

main().catch((err) => {
  console.error(`error: ${err.message}`);
  process.exit(1);
});
