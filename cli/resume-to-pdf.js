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
  -m, --margin <css>    Page margin, any CSS length (default: ${DEFAULT_MARGIN}; use 0 for none)
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
  if (opts.input && opts.input !== "-") {
    const parsed = path.parse(path.resolve(opts.input));
    return path.join(parsed.dir, `${parsed.name}.pdf`);
  }
  return path.resolve("resume.pdf");
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

    console.error(`→ Opening ${opts.url}`);
    await page.goto(opts.url, { waitUntil: "domcontentloaded" });

    // Replicate the "jsondebug" tool: stash the JSON in sessionStorage and
    // reload so it renders through the site's normal populateResume() path.
    console.error(`→ Injecting JSON and re-rendering…`);
    await page.evaluate(
      (key, value) => sessionStorage.setItem(key, value),
      DEBUG_STORAGE_KEY,
      json
    );
    await page.reload({ waitUntil: "networkidle0" });

    // Wait until the loading overlay is gone and the resume actually rendered.
    await page.waitForFunction(
      () => {
        const loading = document.querySelector(".loading-screen");
        const name = document.querySelector(".name");
        return !loading && name && name.textContent.trim().length > 0;
      },
      { timeout: opts.timeout }
    );

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

main().catch((err) => {
  console.error(`error: ${err.message}`);
  process.exit(1);
});
