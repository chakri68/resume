// convert.js
const fs = require("fs");
const puppeteer = require("puppeteer");

(async () => {
  const htmlPath = "index.html";
  const pdfPath = "output.pdf";

  if (!fs.existsSync(htmlPath)) {
    console.error("HTML file not found.");
    process.exit(1);
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = fs.readFileSync(htmlPath, "utf8");
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({ path: pdfPath, format: "A4" });

  await browser.close();
})();
