import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
const output = path.resolve(".artifacts", "visual-qa");
const targets = [
  ["en", 1920, 1080],
  ["en", 1440, 900],
  ["en", 1024, 768],
  ["en", 768, 1024],
  ["en", 390, 844],
  ["ar", 1920, 1080],
  ["ar", 1440, 900],
  ["ar", 1024, 768],
  ["ar", 768, 1024],
  ["ar", 390, 844],
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ colorScheme: "dark" });

for (const [locale, width, height] of targets) {
  await page.setViewportSize({ width, height });
  await page.goto(`${baseURL}/${locale}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(output, `${locale}-${width}x${height}.png`) });
}

for (const locale of ["en", "ar"]) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${baseURL}/${locale}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(output, `${locale}-homepage-full.png`), fullPage: true });
}

await browser.close();
console.log(`Created ${targets.length + 2} screenshots in ${output}`);
