/**
 * Draws the app's logo (eight soft petals, one filled in) and writes every icon the app and website use:
 * the app icon, Android's adaptive icon layers, the splash image, the favicon and the website icon.
 *
 * Run it after changing the mark below: `node scripts/make-icons.js`. It needs Playwright with
 * Chromium (not a project dependency); install it with `npm i -D playwright && npx playwright install chromium`.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BLUE = '#5B9BB5';
const CREAM = '#FAF8F5';
const root = path.join(__dirname, '..');

/**
 * The mark: eight soft petals, like the feelings wheel, with one filled in for the feeling you pick.
 * Drawn in a 100 × 100 box.
 */
const petal = 'M50 40 C42 34 42 18 50 12 C58 18 58 34 50 40 Z';
const mark = (color) =>
  [0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => {
      const paint = i === 1 ? `fill="${color}"` : 'fill="none"';
      return `<path transform="rotate(${i * 45} 50 50)" d="${petal}" ${paint} stroke="${color}" stroke-width="4" stroke-linejoin="round"/>`;
    })
    .join('') + `<circle cx="50" cy="50" r="4" fill="${color}"/>`;

/** A square SVG with the mark scaled to `share` of its width, centred, on an optional background. */
const svg = ({ color = BLUE, background, share, radius = 0 }) => {
  const offset = (100 - 100 * share) / 2;
  const fill = background ? `<rect width="100" height="100" rx="${radius}" fill="${background}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${fill}<g transform="translate(${offset} ${offset}) scale(${share})">${mark(color)}</g></svg>`;
};

const outputs = [
  // iOS and the default icon: full square, the system rounds the corners.
  { file: 'assets/images/icon.png', size: 1024, svg: svg({ background: CREAM, share: 0.7 }) },
  // Android adaptive icon: the mark stays inside the central safe zone (66%).
  { file: 'assets/images/android-icon-foreground.png', size: 512, svg: svg({ share: 0.58 }) },
  { file: 'assets/images/android-icon-background.png', size: 512, svg: svg({ background: CREAM, share: 0 }).replace(/<g.*<\/g>/s, '') },
  { file: 'assets/images/android-icon-monochrome.png', size: 432, svg: svg({ color: '#000000', share: 0.58 }) },
  { file: 'assets/images/splash-icon.png', size: 400, svg: svg({ share: 1 }) },
  { file: 'assets/images/favicon.png', size: 48, svg: svg({ background: CREAM, share: 0.78, radius: 22 }) },
  { file: 'site/icon.png', size: 192, svg: svg({ background: CREAM, share: 0.7 }) },
  // The vector logo, for anything else (store listings, printed material).
  { file: 'assets/logo/logo.svg', svg: svg({ background: CREAM, share: 0.7 }) },
  { file: 'assets/logo/mark.svg', svg: svg({ share: 1 }) },
];

(async () => {
  const browser = await chromium.launch();
  for (const out of outputs) {
    const target = path.join(root, out.file);
    if (!out.size) {
      fs.writeFileSync(target, `${out.svg}\n`);
      continue;
    }
    const page = await browser.newPage({ viewport: { width: out.size, height: out.size } });
    await page.setContent(
      `<html><body style="margin:0;background:transparent">${out.svg.replace('<svg ', `<svg width="${out.size}" height="${out.size}" `)}</body></html>`,
    );
    await page.screenshot({ path: target, omitBackground: true, clip: { x: 0, y: 0, width: out.size, height: out.size } });
    await page.close();
  }
  await browser.close();
  console.log(`Wrote ${outputs.length} files.`);
})();
