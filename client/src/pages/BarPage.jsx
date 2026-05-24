import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import socket from '../socket'
import { menuSections } from '../data/menuData'

const fmtClock = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const fmtStamp = iso => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

const C = {
  accent:  '#0ea5e9',
  bright:  '#38bdf8',
  glow:    'rgba(14,165,233,0.11)',
  border:  'rgba(14,165,233,0.22)',
  bgCard:  '#0a1218',
}

export default function BarPage() {
  const [orders, setOrders] = useState([])
  const [clock,  setClock]  = useState(fmtClock())

  useEffect(() => {
    const t = setInterval(() => setClock(fmtClock()), 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SOCKET_URL || ''}/api/orders?type=drink`)
      .then(r => r.json())
      .then(data => setOrders(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = o => setOrders(p => {
      if (p.some(x => x.id === o.id)) return p
      return [o, ...p]
    })
    socket.on('new_drink_order', handler)
    return () => socket.off('new_drink_order', handler)
  }, [])

  const simulate = () => {
    const tableId   = String(Math.floor(Math.random() * 10) + 1)
    const allDrinks = menuSections.drink.flatMap(s => s.items)
    const n = Math.floor(Math.random() * 3) + 1
    const items = allDrinks.slice(0, n).map(i => ({ ...i, quantity: Math.ceil(Math.random() * 2) }))
    setOrders(p => [{ id: `sim-${Date.now()}`, tableId, items, status: 'pending', timestamp: new Date().toISOString() }, ...p])
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ambient glow */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[300px]"
        style={{ background: `radial-gradient(ellipse at top right, ${C.glow} 0%, transparent 70%)`, zIndex: 0 }} />

      {/* ── header ─────────────────────────────────────────── */}
      <div className="relative z-10 shrink-0 flex items-center justify-between px-8 py-4"
        style={{ borderBottom: '1px solid rgba(14,165,233,0.1)', background: '#0a1014' }}>
        <div className="flex items-center gap-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: C.glow, border: `1px solid ${C.border}` }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M8 22h8M12 11v11M3 3l9 8 9-8H3z" stroke={C.bright} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.24em] uppercase font-semibold" style={{ color: C.accent }}>
              Bar Display
            </p>
            <p className="text-lg font-semibold mt-0.5 leading-none" style={{ color: 'var(--text)' }}>
              Osteria Moderna
            </p>
          </div>

          <AnimatePresence>
            {orders.length > 0 && (
              <motion.div key="b"
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                className="flex items-center gap-2 rounded-full px-3 py-1.5"
                style={{ background: C.glow, border: `1px solid ${C.border}` }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.bright }} />
                <span className="text-sm font-semibold tabular-nums" style={{ color: C.bright }}>
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium tabular-nums" style={{ color: 'var(--text-35)' }}>{clock}</span>
          <motion.button onClick={simulate} whileTap={{ scale: 0.96 }}
            className="text-sm font-medium px-4 py-2 rounded-xl"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-60)' }}>
            Simulate Order
          </motion.button>
        </div>
      </div>

      {/* ── orders ─────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="popLayout">
          {orders.length === 0 ? (
            <motion.div key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[65vh] gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(14,165,233,.06)', border: `1px solid ${C.border}` }}>
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
                  <path d="M8 22h8M12 11v11M3 3l9 8 9-8H3z" stroke={C.border} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-35)' }}>Bar is quiet</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {orders.map(order => (
                  <motion.div key={order.id} layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.2 } }}
                    transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                    className="flex flex-col rounded-2xl overflow-hidden glow-cyan"
                    style={{ background: C.bgCard, border: `1px solid rgba(14,165,233,0)` }}>

                    {/* giant table number */}
                    <div className="px-5 pt-5 pb-4"
                      style={{ borderBottom: `1px solid rgba(14,165,233,0.1)` }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[9px] tracking-[0.22em] uppercase font-semibold mb-1"
                            style={{ color: 'rgba(14,165,233,.45)' }}>Table</p>
                          <p className="font-serif font-bold leading-none tabular-nums"
                            style={{ fontSize: '5rem', color: C.bright, lineHeight: 1 }}>
                            {order.tableId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] tabular-nums" style={{ color: 'var(--text-35)' }}>
                            {fmtStamp(order.timestamp)}
                          </p>
                          <div className="flex items-center justify-end gap-1.5 mt-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.bright }} />
                            <span className="text-[10px] font-semibold" style={{ color: C.bright }}>Live</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* items */}
                    <div className="px-5 py-4 flex-1 space-y-2.5">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="shrink-0 w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center"
                            style={{ background: C.glow, color: C.bright, border: `1px solid ${C.border}` }}>
                            {item.quantity ?? 1}
                          </span>
                          <span className="text-[13px] leading-snug" style={{ color: 'var(--text-60)' }}>
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* status badge */}
                    <div className="px-4 pb-4">
                      <div className="w-full py-2.5 rounded-xl text-[12px] font-semibold text-center"
                        style={{ background: C.glow, color: C.bright, border: `1px solid ${C.border}` }}>
                        Preparing
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
