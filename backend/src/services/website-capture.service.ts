import puppeteer from "puppeteer";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export interface CaptureResult {
  captureId: string;
  title: string;
  description: string;
  ogImage?: string;
  faviconUrl?: string;
  brandColors: string[];
  screenshots: string[];
  fullPageScreenshot: string;
}

// Simple semaphore to limit concurrent captures
let activeCaptureCount = 0;
const MAX_CONCURRENT = 2;

async function acquireSemaphore(): Promise<void> {
  while (activeCaptureCount >= MAX_CONCURRENT) {
    await new Promise((r) => setTimeout(r, 500));
  }
  activeCaptureCount++;
}

function releaseSemaphore(): void {
  activeCaptureCount = Math.max(0, activeCaptureCount - 1);
}

export async function captureWebsite(url: string): Promise<CaptureResult> {
  await acquireSemaphore();

  const captureId = randomUUID();
  const captureDir = path.join("uploads", "website-captures", captureId);
  await fs.mkdir(captureDir, { recursive: true });

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Set a real user agent to avoid bot detection
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });

    // Wait extra for JS-heavy sites to finish rendering
    await new Promise((r) => setTimeout(r, 2000));

    // Extract metadata (runs in browser context via Puppeteer)
    const metadata = await page.evaluate(`(() => {
        const title = document.title || "";
        const descMeta = document.querySelector('meta[name="description"]');
        const description = descMeta ? descMeta.content : "";
        const ogImageMeta = document.querySelector('meta[property="og:image"]');
        const ogImage = ogImageMeta ? ogImageMeta.content : undefined;
        const faviconLink = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
        const faviconUrl = faviconLink ? faviconLink.href : undefined;

        const colors = new Set();
        const elements = [
          document.body,
          document.querySelector("header"),
          document.querySelector("nav"),
          document.querySelector("h1"),
          document.querySelector("button"),
          document.querySelector("a"),
        ].filter(Boolean);

        for (const el of elements) {
          const style = getComputedStyle(el);
          for (const prop of ["backgroundColor", "color", "borderColor"]) {
            const val = style[prop];
            if (val && val !== "rgba(0, 0, 0, 0)" && val !== "transparent" && val !== "rgb(0, 0, 0)" && val !== "rgb(255, 255, 255)") {
              colors.add(val);
            }
          }
        }

        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor && themeColor.content) colors.add(themeColor.content);

        return { title, description, ogImage, faviconUrl, brandColors: Array.from(colors).slice(0, 6) };
      })()`) as { title: string; description: string; ogImage?: string; faviconUrl?: string; brandColors: string[] };

    const screenshots: string[] = [];

    // Dismiss cookie banners / popups by clicking common selectors
    await page.evaluate(`(() => {
      const selectors = [
        '[class*="cookie"] button',
        '[class*="consent"] button',
        '[id*="cookie"] button',
        'button[class*="accept"]',
        'button[class*="Accept"]',
        '[class*="banner"] button:first-of-type',
      ];
      for (const sel of selectors) {
        const btn = document.querySelector(sel);
        if (btn) { btn.click(); break; }
      }
    })()`);
    await new Promise((r) => setTimeout(r, 500));

    // Hero screenshot (above-fold)
    const heroPath = path.join(captureDir, "hero.png");
    await page.screenshot({ path: heroPath, type: "png" });
    screenshots.push(heroPath);

    // Get actual scrollable height
    const pageHeight = await page.evaluate(`document.documentElement.scrollHeight`) as number;
    const viewportHeight = 1080;

    console.log(`[capture] Page height: ${pageHeight}px, viewport: ${viewportHeight}px for ${url}`);

    // Always capture at least a few sections even if page seems short
    // Some sites report wrong scrollHeight initially
    const scrollPositions = [
      Math.round(viewportHeight * 0.8),
      Math.round(viewportHeight * 1.6),
      Math.round(viewportHeight * 2.4),
      Math.round(viewportHeight * 3.2),
      Math.round(viewportHeight * 4.0),
    ].filter((pos) => pos < pageHeight);

    // If page is very short, at least try scrolling down once
    if (scrollPositions.length === 0 && pageHeight > viewportHeight * 0.5) {
      scrollPositions.push(Math.round(pageHeight * 0.5));
    }

    for (let i = 0; i < scrollPositions.length; i++) {
      await page.evaluate(`window.scrollTo({ top: ${scrollPositions[i]}, behavior: 'instant' })`);
      // Longer wait to trigger lazy-loaded images and content
      await new Promise((r) => setTimeout(r, 800));
      const sectionPath = path.join(captureDir, `section-${i + 1}.png`);
      await page.screenshot({ path: sectionPath, type: "png" });
      screenshots.push(sectionPath);
    }

    // Full-page screenshot
    await page.evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
    await new Promise((r) => setTimeout(r, 500));
    const fullPagePath = path.join(captureDir, "full-page.png");
    await page.screenshot({ path: fullPagePath, type: "png", fullPage: true });

    await browser.close();

    // Normalize paths to forward slashes for URL serving
    const normalize = (p: string) => p.replace(/\\/g, "/");

    return {
      captureId,
      title: metadata.title,
      description: metadata.description,
      ogImage: metadata.ogImage,
      faviconUrl: metadata.faviconUrl,
      brandColors: metadata.brandColors,
      screenshots: screenshots.map(normalize),
      fullPageScreenshot: normalize(fullPagePath),
    };
  } catch (error) {
    if (browser) await browser.close();
    // Clean up on failure
    await fs.rm(captureDir, { recursive: true, force: true }).catch(() => {});
    throw error;
  } finally {
    releaseSemaphore();
  }
}
