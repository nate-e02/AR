import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import socket from '../socket'
import { menuSections } from '../data/menuData'

const fmtClock = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const fmtStamp = iso => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
const elapsed  = iso => {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 1) return { label: 'Just now', color: 'var(--text-35)' }
  if (m < 8) return { label: `${m}m`, color: '#d4920e' }
  return       { label: `${m}m`, color: '#ef4444' }
}

export default function KitchenPage() {
  const [orders,  setOrders]  = useState([])
  const [clock,   setClock]   = useState(fmtClock())

  // Tick the clock + recolour age indicators
  useEffect(() => {
    const t = setInterval(() => setClock(fmtClock()), 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SOCKET_URL || ''}/api/orders?type=food`)
      .then(r => r.json())
      .then(data => setOrders(data.map(o => ({ ...o, ds: 'pending' }))))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = o => setOrders(p => {
      if (p.some(x => x.id === o.id)) return p
      return [{ ...o, ds: 'pending' }, ...p]
    })
    socket.on('new_food_order', handler)
    return () => socket.off('new_food_order', handler)
  }, [])

  const markReady = useCallback((id, tableId) => {
    setOrders(p => p.map(o => o.id === id ? { ...o, ds: 'ready' } : o))
    socket.emit('mark_ready', { orderId: id, tableId })
    setTimeout(() => setOrders(p => p.filter(o => o.id !== id)), 1800)
  }, [])

  const simulate = () => {
    const tableId = String(Math.floor(Math.random() * 10) + 1)
    const allFood = menuSections.food.flatMap(s => s.items)
    const n = Math.floor(Math.random() * 3) + 1
    const items = allFood.slice(0, n).map(i => ({ ...i, quantity: Math.ceil(Math.random() * 2) }))
    setOrders(p => [{ id: `sim-${Date.now()}`, tableId, items, status: 'pending', timestamp: new Date().toISOString(), ds: 'pending' }, ...p])
  }

  const pending = orders.filter(o => o.ds === 'pending').length

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── header bar ─────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-8 py-4"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-warm)' }}>
        <div className="flex items-center gap-5">
          {/* logo mark */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--gold-glow)', border: '1px solid var(--gold-border)' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M12 2C9 2 6 5 6 9c0 3 1.5 5.5 3 7H6v2h12v-2h-3c1.5-1.5 3-4 3-7 0-4-3-7-6-7z" stroke="var(--gold)" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.24em] uppercase font-semibold" style={{ color: 'var(--gold)' }}>
              Kitchen Display
            </p>
            <p className="text-lg font-semibold mt-0.5 leading-none" style={{ color: 'var(--text)' }}>
              Osteria Moderna
            </p>
          </div>

          <AnimatePresence>
            {pending > 0 && (
              <motion.div key="badge"
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                className="flex items-center gap-2 rounded-full px-3 py-1.5"
                style={{ background: 'var(--gold-glow)', border: '1px solid var(--gold-border)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--gold-bright)' }} />
                <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--gold-bright)' }}>
                  {pending} pending
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium tabular-nums" style={{ color: 'var(--text-35)' }}>{clock}</span>
          <motion.button onClick={simulate} whileTap={{ scale: 0.96 }}
            className="text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-60)' }}>
            Simulate Order
          </motion.button>
        </div>
      </div>

      {/* ── orders grid ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="popLayout">
          {orders.length === 0 ? (
            <motion.div key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[65vh] gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
                  <path d="M12 2C9 2 6 5 6 9c0 3 1.5 5.5 3 7H6v2h12v-2h-3c1.5-1.5 3-4 3-7 0-4-3-7-6-7z" stroke="var(--text-35)" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-35)' }}>Kitchen is clear</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {orders.map(order => {
                  const age   = elapsed(order.timestamp)
                  const ready = order.ds === 'ready'
                  return (
                    <motion.div key={order.id} layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: ready ? 0.5 : 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.2 } }}
                      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                      className={`flex flex-col rounded-2xl overflow-hidden ${!ready ? 'glow-gold' : ''}`}
                      style={{
                        background: ready ? 'rgba(34,197,94,.05)' : 'var(--surface-1)',
                        border:     ready ? '1px solid rgba(34,197,94,.3)' : '1px solid rgba(200,134,10,.0)',
                      }}>

                      {/* giant table number block */}
                      <div className="px-5 pt-5 pb-4"
                        style={{ borderBottom: '1px solid var(--border)' }}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[9px] tracking-[0.22em] uppercase font-semibold mb-1"
                              style={{ color: ready ? 'rgba(34,197,94,.6)' : 'var(--text-18)' }}>
                              Table
                            </p>
                            <p className="font-serif font-bold leading-none tabular-nums"
                              style={{ fontSize: '5rem', color: ready ? '#4ade80' : 'var(--gold-bright)', lineHeight: 1 }}>
                              {order.tableId}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] tabular-nums" style={{ color: 'var(--text-35)' }}>
                              {fmtStamp(order.timestamp)}
                            </p>
                            <p className="text-[11px] font-semibold mt-1 tabular-nums"
                              style={{ color: ready ? '#4ade80' : age.color }}>
                              {ready ? 'Ready' : age.label}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* items list */}
                      <div className="px-5 py-4 flex-1 space-y-2.5">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="shrink-0 w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center"
                              style={{ background: 'var(--gold-glow)', color: 'var(--gold-bright)', border: '1px solid var(--gold-border)' }}>
                              {item.quantity ?? 1}
                            </span>
                            <span className="text-[13px] leading-snug" style={{ color: 'var(--text-60)' }}>
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* action */}
                      <div className="px-4 pb-4">
                        {!ready ? (
                          <motion.button onClick={() => markReady(order.id, order.tableId)}
                            whileTap={{ scale: 0.97 }}
                            className="w-full py-3 rounded-xl text-sm font-semibold"
                            style={{
                              background: 'var(--gold-glow)',
                              color: 'var(--gold-bright)',
                              border: '1px solid var(--gold-border)',
                            }}>
                            Mark as Ready
                          </motion.button>
                        ) : (
                          <div className="w-full py-3 rounded-xl text-sm font-semibold text-center"
                            style={{ background: 'rgba(34,197,94,.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,.25)' }}>
                            ✓  Sent to Waiter
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
