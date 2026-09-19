#!/usr/bin/env node
// Renders the raster brand assets from their sources, so they can't drift:
//   scripts/og-card.html → og-image.png          (1200×630 link preview)
//   favicon.svg          → icon-512.png          (rounded tile, transparent corners)
//                        → apple-touch-icon.png  (180×180, square + opaque — iOS rounds it itself)
// Same headless Chrome the PDF CLI uses. Run: npm run brand
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const puppeteer = require("puppeteer");

const ROOT = path.resolve(__dirname, "..");
const at = (...p) => path.join(ROOT, ...p);

async function renderIcon(page, svg, { size, out, square }) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  // Pin the light palette (headless Chrome has no opinion on colour scheme, but be
  // explicit), and for iOS drop the tile's edge so it fills the square cleanly.
  const pinned = svg.replace(
    "</svg>",
    `<style>:root{--tile:#ffffff;--edge:#c6c6c6;--ink:#101010;--accent:#395b9c}${square ? ".tile{stroke:none}" : ""}</style></svg>`
  );
  await page.setContent(
    `<style>html,body{margin:0;background:${square ? "#ffffff" : "transparent"}}svg{display:block;width:${size}px;height:${size}px}</style>${pinned}`
  );
  await page.screenshot({ path: out, omitBackground: !square, clip: { x: 0, y: 0, width: size, height: size } });
  console.log(`✓ ${path.relative(ROOT, out)}`);
}

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();

    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(at("scripts/og-card.html")).href, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: at("og-image.png"), clip: { x: 0, y: 0, width: 1200, height: 630 } });
    console.log("✓ og-image.png");

    const svg = fs.readFileSync(at("favicon.svg"), "utf8");
    await renderIcon(page, svg, { size: 512, out: at("icon-512.png"), square: false });
    await renderIcon(page, svg, { size: 180, out: at("apple-touch-icon.png"), square: true });
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
