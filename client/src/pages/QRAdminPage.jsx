import { motion } from 'framer-motion'

const TABLES = Array.from({ length: 10 }, (_, i) => i + 1)

const PrintIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M6 9V2h12v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="6" y="14" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const handlePrint = (tableId) => {
  const src = `/api/qr/${tableId}`
  const win = window.open('', '_blank', 'width=400,height=500')
  if (!win) return
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Table ${tableId} — Osteria Moderna</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 100vh;
      font-family: system-ui, sans-serif; background: #fff; color: #111;
      padding: 2rem;
    }
    img { width: 260px; height: 260px; }
    h2 { margin-top: 1.5rem; font-size: 1.4rem; font-weight: 700; }
    p  { margin-top: 0.4rem; color: #666; font-size: 0.9rem; }
  </style>
</head>
<body>
  <img src="${window.location.origin}${src}" alt="QR Table ${tableId}" />
  <h2>Table ${tableId}</h2>
  <p>Osteria Moderna</p>
  <script>window.onload = () => { window.print(); window.close(); }</script>
</body>
</html>`)
  win.document.close()
}

export default function QRAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — light themed */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <p className="text-[10px] tracking-[0.2em] uppercase text-amber-600 font-bold">Osteria Moderna</p>
        <h1 className="text-2xl font-semibold text-gray-900 mt-1">QR Code Manager</h1>
        <p className="text-sm text-gray-400 mt-1">Print and place QR codes on each table so guests can scan to order</p>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {TABLES.map((tableId, i) => (
            <motion.div
              key={tableId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4 flex flex-col items-center">
                <p className="text-[10px] tracking-widest uppercase font-bold text-amber-600 mb-3">
                  Table {tableId}
                </p>

                {/* QR image */}
                <div className="w-full aspect-square bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100">
                  <img
                    src={`/api/qr/${tableId}`}
                    alt={`QR code for table ${tableId}`}
                    className="w-full h-full object-contain p-1.5"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center text-gray-300 text-xs text-center p-2">
                    Server offline
                  </div>
                </div>

                <motion.button
                  onClick={() => handlePrint(tableId)}
                  whileTap={{ scale: 0.97 }}
                  className="mt-3 w-full py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  style={{ background: '#111', color: '#fff' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#333')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#111')}
                >
                  <PrintIcon />
                  Print
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Nav links for dev convenience */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-4">Quick navigation</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/table/1', label: 'Menu (Table 1)' },
              { href: '/kitchen', label: 'Kitchen' },
              { href: '/bar', label: 'Bar' },
              { href: '/waiter', label: 'Waiter' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
