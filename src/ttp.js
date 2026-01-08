const { createCanvas, GlobalFonts } = require('@napi-rs/canvas')
const path = require('path')
const fs = require('fs')
const os = require('os')

const FONT_PATH = path.join(__dirname, '../font/Marcellus-Regular.ttf')
GlobalFonts.registerFromPath(FONT_PATH, 'Marcellus')

const COLOR_MAP = {
  putih: '#ffffff',
  merah: '#ff0000',
  kuning: '#ffff00',
  hijau: '#00ff00',
  biru: '#00aaff',
  orange: '#ff9900',
  ungu: '#8e44ad',
  emas: '#ffd700',
  pink: '#ff69b4'
}

async function generateTTP(text, options = {}) {
  if (!text) throw new Error('Text is required')

  const color = COLOR_MAP[options.color] || '#ffffff'
  const size = options.size || 512
  const padding = 40
  const maxWidth = size - padding * 2

  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  let fontSize = 120
  let lines = []

  while (fontSize > 20) {
    ctx.font = `${fontSize}px Marcellus`
    lines = wrapText(ctx, text, maxWidth)
    if (lines.length * fontSize * 1.25 <= size - padding * 2) break
    fontSize -= 5
  }

  ctx.font = `${fontSize}px Marcellus`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = Math.max(2, fontSize / 18)

  const lineHeight = fontSize * 1.25
  let y = size / 2 - ((lines.length - 1) * lineHeight) / 2

  for (const line of lines) {
    ctx.strokeText(line, size / 2, y)
    ctx.fillText(line, size / 2, y)
    y += lineHeight
  }

  return canvas.toBuffer('image/png')
}

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

module.exports = { generateTTP }
