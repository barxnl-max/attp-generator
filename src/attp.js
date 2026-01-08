const { createCanvas, GlobalFonts } = require('@napi-rs/canvas')
const GIFEncoder = require('gif-encoder-2')
const path = require('path')
const fs = require('fs')
const os = require('os')

/* ================= FONT ================= */
const FONT_PATH = path.join(__dirname, '../font/Marcellus-Regular.ttf')
GlobalFonts.registerFromPath(FONT_PATH, 'Marcellus')

/* ================= DEFAULT OPTIONS ================= */
const DEFAULT_OPTIONS = {
  size: 512,
  padding: 40,
  frames: 20,
  delay: 80,
  fontFamily: 'Marcellus',
  strokeColor: '#000000',
  strokeRatio: 18,
  colors: [
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#ff00ff',
    '#00ffff'
  ]
}

/* ================= MAIN ================= */
async function generateATTP(text, options = {}) {
  if (!text || typeof text !== 'string') {
    throw new Error('Text is required')
  }

  const opt = { ...DEFAULT_OPTIONS, ...options }

  const canvas = createCanvas(opt.size, opt.size)
  const ctx = canvas.getContext('2d')

  const encoder = new GIFEncoder(opt.size, opt.size)
  const tmpPath = path.join(os.tmpdir(), `attp_${Date.now()}.gif`)

  encoder.start()
  encoder.setRepeat(0)
  encoder.setDelay(opt.delay)
  encoder.setTransparent(0x000000)

  const maxWidth = opt.size - opt.padding * 2

  let fontSize = 120
  let lines = []

  /* AUTO SCALE */
  while (fontSize > 24) {
    ctx.font = `${fontSize}px ${opt.fontFamily}`
    lines = wrapText(ctx, text, maxWidth)

    const lineHeight = fontSize * 1.3
    if (lines.length * lineHeight <= opt.size - opt.padding * 2) break
    fontSize -= 4
  }

  /* FRAMES */
  for (let i = 0; i < opt.frames; i++) {
    ctx.clearRect(0, 0, opt.size, opt.size)

    ctx.font = `${fontSize}px ${opt.fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillStyle = opt.colors[i % opt.colors.length]
    ctx.strokeStyle = opt.strokeColor
    ctx.lineWidth = Math.max(3, fontSize / opt.strokeRatio)

    const lineHeight = fontSize * 1.3
    let y = opt.size / 2 - ((lines.length - 1) * lineHeight) / 2

    for (const line of lines) {
      ctx.strokeText(line, opt.size / 2, y)
      ctx.fillText(line, opt.size / 2, y)
      y += lineHeight
    }

    encoder.addFrame(ctx)
  }

  encoder.finish()
  fs.writeFileSync(tmpPath, encoder.out.getData())

  const buffer = fs.readFileSync(tmpPath)
  fs.unlinkSync(tmpPath)

  return buffer
}

/* ================= TEXT WRAP ================= */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''

  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth) {
      if (line) lines.push(line)
      line = word
    } else {
      line = test
    }
  }

  if (line) lines.push(line)
  return lines
}

module.exports = { generateATTP }
