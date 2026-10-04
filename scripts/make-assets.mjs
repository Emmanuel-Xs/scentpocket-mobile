// Renders the app icons, splash and header wordmark from the web repo's brand files.
// Run: node scripts/make-assets.mjs   (sharp is a devDependency)
import { readFileSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'

const CREAM = '#FAF6EF'
const INK = { r: 28, g: 25, b: 21 }
const svg = readFileSync('assets/source/logo.svg')
const out = (name) => `assets/${name}`
mkdirSync('assets', { recursive: true })

/** The pocket bottle, rendered crisp at a given height (viewBox is 100x116). */
const logo = (height) =>
  sharp(svg, { density: 72 * Math.ceil((height / 116) * 4) })
    .resize({ height })
    .png()
    .toBuffer()


async function save(size, logoHeight, background, file) {
  await sharp({
    create: { width: size, height: size, channels: 4, background: background ?? { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: await logo(logoHeight), gravity: 'centre' }])
    .png()
    .toFile(out(file))
}

// App icon: logo on cream, about 60% of the height.
await save(1024, 620, CREAM, 'icon.png')
await sharp(out('icon.png')).flatten({ background: CREAM }).removeAlpha().toBuffer().then((b) => sharp(b).toFile(out('icon.png')))
// Adaptive foreground: transparent, logo inside the centre 66% safe zone (676px).
await save(1024, 594, null, 'adaptive-icon.png')
// Splash: the logo alone, tightly cropped (shown at about 200px wide).
await sharp(await logo(696)).toFile(out('splash-icon.png'))

// Header wordmark: the email logo with its cream background turned into transparency.
const { data, info } = await sharp('assets/source/wordmark-email.png').removeAlpha().raw().toBuffer({ resolveWithObject: true })
const lum = (i) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
const cream = 0.299 * 250 + 0.587 * 246 + 0.114 * 239
const ink = 0.299 * INK.r + 0.587 * INK.g + 0.114 * INK.b
const rgba = Buffer.alloc(info.width * info.height * 4)
for (let p = 0; p < info.width * info.height; p++) {
  const alpha = Math.max(0, Math.min(1, (cream - lum(p * 3)) / (cream - ink)))
  rgba[p * 4] = INK.r
  rgba[p * 4 + 1] = INK.g
  rgba[p * 4 + 2] = INK.b
  rgba[p * 4 + 3] = Math.round(alpha * 255)
}
await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(out('wordmark.png'))

// Contact sheet for eyeballing (not shipped).
const tile = 360
const tiles = [
  ['icon.png', CREAM],
  ['adaptive-icon.png', '#FAF6EF'],
  ['splash-icon.png', CREAM],
  ['wordmark.png', CREAM],
]
const layers = []
for (const [i, [file, bg]] of tiles.entries()) {
  const img = await sharp(out(file)).resize({ width: tile - 40, height: tile - 40, fit: 'inside' }).png().toBuffer()
  const cell = await sharp({ create: { width: tile, height: tile, channels: 4, background: bg } })
    .composite([{ input: img, gravity: 'centre' }])
    .png()
    .toBuffer()
  layers.push({ input: cell, left: i * (tile + 10), top: 0 })
}
await sharp({ create: { width: tiles.length * (tile + 10), height: tile, channels: 4, background: '#888' } })
  .composite(layers)
  .png()
  .toFile(process.env.SHEET ?? 'assets/source/contact-sheet.png')

// ---- UI icons (Lucide-style outlines, stroke 1.5) as 96px PNGs, tinted at runtime ----
// expo-image's inline SVG did not render on Android, so the app uses these with a plain <Image tintColor>.
const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  back: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
}
mkdirSync('assets/icons', { recursive: true })
for (const [name, body] of Object.entries(ICONS)) {
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
  await sharp(Buffer.from(icon), { density: 72 * 4 }).resize(96, 96).png().toFile(`assets/icons/${name}.png`)
}
