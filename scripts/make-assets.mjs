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
