const QRCode = require('qrcode')
const fs = require('fs')
const path = require('path')

const BASE_URL = process.env.MENU_BASE_URL || 'https://client-gamma-five-14.vercel.app'
const TABLES = 10
const OUT_DIR = path.join(__dirname, '..', 'qr-codes')

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR)

  const codes = []

  for (let i = 1; i <= TABLES; i++) {
    const url = `${BASE_URL}/table/${i}`
    await QRCode.toFile(path.join(OUT_DIR, `table-${i}.png`), url, {
      width: 600, margin: 2, color: { dark: '#000000', light: '#ffffff' },
    })
    const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 })
    codes.push({ table: i, url, dataUrl })
    console.log(`✓ Table ${i}  →  ${url}`)
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Osteria Moderna — Table QR Codes</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; background: #fff; padding: 32px; }
    h1 { text-align: center; font-size: 22px; letter-spacing: 0.08em; margin-bottom: 6px; }
    p.sub { text-align: center; font-size: 12px; color: #666; margin-bottom: 28px; letter-spacing: 0.06em; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
    .card { display: flex; flex-direction: column; align-items: center; border: 1px solid #e0e0e0; border-radius: 10px; padding: 18px 12px 14px; gap: 10px; }
    .card img { width: 160px; height: 160px; }
    .card .label { font-size: 15px; font-weight: bold; letter-spacing: 0.05em; }
    .card .url { font-size: 8px; color: #999; font-family: monospace; word-break: break-all; text-align: center; }
    @media print {
      body { padding: 16px; }
      .card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>OSTERIA MODERNA</h1>
  <p class="sub">Scan to view the menu for your table</p>
  <div class="grid">
    ${codes.map(c => `
    <div class="card">
      <img src="${c.dataUrl}" alt="Table ${c.table} QR code">
      <span class="label">Table ${c.table}</span>
      <span class="url">${c.url}</span>
    </div>`).join('')}
  </div>
</body>
</html>`

  fs.writeFileSync(path.join(__dirname, '..', 'qr-print.html'), html)
  console.log('\nDone.')
  console.log('  PNGs  →  qr-codes/')
  console.log('  Print →  qr-print.html  (open in browser and Ctrl+P)')
}

main().catch(console.error)
