import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { menuSections } from '../data/menuData'
import socket from '../socket'

/* ── icons ───────────────────────────────────────────────── */
const Plus  = () => <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
const Minus = () => <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><path d="M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
const Check = () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Close = () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>

/* ── helpers ─────────────────────────────────────────────── */
const fmt = n => `€${n.toFixed(2)}`

export default function MenuPage() {
  const { tableId } = useParams()
  const [tab, setTab]           = useState('food')
  const [cart, setCart]         = useState([])          // [{ item, qty }]
  const [sheetOpen, setSheet]   = useState(false)
  const [orderState, setOrder]  = useState('idle')      // idle | success
  const [flashId, setFlash]     = useState(null)

  const totalQty  = cart.reduce((s, c) => s + c.qty, 0)
  const totalAmt  = cart.reduce((s, c) => s + c.item.price * c.qty, 0)
  const cartQty   = id => cart.find(c => c.item.id === id)?.qty ?? 0

  const addItem = useCallback((item) => {
    setFlash(item.id); setTimeout(() => setFlash(null), 500)
    setCart(p => {
      const hit = p.find(c => c.item.id === item.id)
      return hit ? p.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c) : [...p, { item, qty: 1 }]
    })
  }, [])

  const adjustQty = useCallback((id, d) =>
    setCart(p => p.map(c => c.item.id === id ? { ...c, qty: c.qty + d } : c).filter(c => c.qty > 0)), [])

  const placeOrder = () => {
    if (orderState !== 'idle') return
    socket.emit('place_order', {
      tableId,
      items: cart.map(c => ({ name: c.item.name, category: c.item.category, price: c.item.price, quantity: c.qty })),
    })
    setOrder('success')
    setTimeout(() => { setOrder('idle'); setCart([]); setSheet(false) }, 2400)
  }

  const sections = menuSections[tab]

  return (
    <div className="min-h-dvh select-none" style={{ background: 'var(--bg)' }}>

      {/* ── ambient header glow ─────────────────────────────── */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72"
        style={{ background: 'radial-gradient(ellipse 80% 240px at 50% -30px, rgba(200,134,10,0.13) 0%, transparent 80%)', zIndex: 0 }} />

      {/* ── header ──────────────────────────────────────────── */}
      <header className="relative z-10 px-5 pt-14 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] tracking-[0.28em] uppercase font-semibold mb-2" style={{ color: 'var(--gold)' }}>
              Osteria · Moderna
            </p>
            <h1 className="font-serif italic leading-none" style={{ fontSize: '2.6rem', color: 'var(--text)' }}>
              il Menù
            </h1>
          </div>
          <div className="mt-1 flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-hi)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }} />
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-60)' }}>Table {tableId}</span>
          </div>
        </div>
      </header>

      {/* ── tabs ────────────────────────────────────────────── */}
      <div className="relative z-10 px-5 pt-4 pb-0 flex items-center gap-6"
        style={{ borderBottom: '1px solid var(--border)' }}>
        {(['food','drink']).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="relative pb-3 text-sm font-medium transition-colors duration-200"
            style={{ color: tab === t ? 'var(--text)' : 'var(--text-35)' }}>
            {t === 'food' ? 'Food' : 'Drinks'}
            {tab === t && (
              <motion.span layoutId="tab-line"
                className="absolute bottom-0 left-0 right-0 h-[1.5px] rounded-full"
                style={{ background: 'var(--gold)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
            )}
          </button>
        ))}
      </div>

      {/* ── menu body ───────────────────────────────────────── */}
      <div className="relative z-10 pb-40">
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}>

            {sections.map((sec, si) => (
              <div key={sec.section}>
                {/* section header */}
                <div className="flex items-center gap-3 px-5 pt-7 pb-3">
                  <span className="text-[9px] tracking-[0.22em] uppercase font-bold shrink-0"
                    style={{ color: 'var(--gold)' }}>{sec.section}</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>

                {/* items */}
                <div className="px-4 space-y-2">
                  {sec.items.map((item, ii) => {
                    const qty     = cartQty(item.id)
                    const active  = qty > 0
                    const flashing = flashId === item.id
                    return (
                      <motion.div key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, delay: (si * 3 + ii) * 0.04 }}
                        className="rounded-2xl overflow-hidden"
                        style={{
                          background: active ? 'var(--surface-2)' : 'var(--surface-1)',
                          boxShadow: active
                            ? 'inset 2px 0 0 var(--gold), 0 0 0 1px var(--gold-border)'
                            : '0 0 0 1px var(--border)',
                        }}>
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            {/* text column */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-[15px] font-semibold leading-snug" style={{ color: 'var(--text)' }}>
                                  {item.name}
                                </p>
                                <AnimatePresence>
                                  {qty > 0 && (
                                    <motion.span key="q"
                                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                      transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                                      className="shrink-0 w-[18px] h-[18px] rounded-full text-[9px] font-bold flex items-center justify-center"
                                      style={{ background: 'var(--gold)', color: '#000' }}>
                                      {qty}
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </div>
                              <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'var(--text-35)' }}>
                                {item.description}
                              </p>
                            </div>

                            {/* price + button column */}
                            <div className="shrink-0 flex flex-col items-end gap-2">
                              <span className="text-[14px] font-semibold tabular-nums" style={{ color: 'var(--gold-bright)' }}>
                                {fmt(item.price)}
                              </span>
                              <motion.button
                                onClick={() => addItem(item)}
                                whileTap={{ scale: 0.85 }}
                                animate={flashing ? { scale: [1, 1.22, 1] } : {}}
                                transition={{ duration: 0.28 }}
                                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150"
                                style={{
                                  background: flashing ? 'var(--gold)' : 'var(--gold-glow)',
                                  color:      flashing ? '#000' : 'var(--gold-bright)',
                                  border:     `1px solid ${flashing ? 'transparent' : 'var(--gold-border)'}`,
                                }}>
                                <Plus />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── floating cart button ─────────────────────────────── */}
      <AnimatePresence>
        {totalQty > 0 && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed bottom-0 inset-x-0 z-40 px-4 pb-8 pt-4"
            style={{ background: 'linear-gradient(to top, var(--bg) 55%, transparent)' }}>
            <motion.button
              onClick={() => setSheet(true)}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #d4920e 0%, #e8a820 60%, #c87c08 100%)',
                boxShadow: '0 4px 32px rgba(200,134,10,0.45), 0 1px 0 rgba(255,240,160,0.25) inset',
                color: '#0d0b09',
              }}>
              <span className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-black/20 text-xs font-bold flex items-center justify-center">
                  {totalQty}
                </span>
                <span className="text-[15px] font-semibold">View Order</span>
              </span>
              <span className="text-[15px] font-semibold opacity-80 tabular-nums">{fmt(totalAmt)}</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── cart bottom sheet ────────────────────────────────── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            {/* backdrop */}
            <motion.div key="bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(6,4,2,0.78)', backdropFilter: 'blur(8px)' }}
              onClick={() => setSheet(false)} />

            {/* sheet */}
            <motion.div key="sh"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 310, damping: 36 }}
              className="fixed bottom-0 inset-x-0 z-50 flex flex-col"
              style={{
                background: 'var(--surface-1)',
                borderTop: '1px solid var(--border-hi)',
                borderRadius: '24px 24px 0 0',
                maxHeight: '88dvh',
              }}>

              {/* drag handle */}
              <div className="flex justify-center pt-3 pb-2 shrink-0">
                <div className="w-9 h-1 rounded-full" style={{ background: 'var(--text-18)' }} />
              </div>

              {/* sheet header */}
              <div className="px-5 pb-4 flex items-start justify-between shrink-0"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Your Order</h2>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-35)' }}>Table {tableId}</p>
                </div>
                <motion.button whileTap={{ scale: 0.88 }} onClick={() => setSheet(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                  style={{ background: 'var(--surface-3)', color: 'var(--text-60)' }}>
                  <Close />
                </motion.button>
              </div>

              {/* items */}
              <div className="flex-1 overflow-y-auto min-h-0 px-5 py-2">
                <AnimatePresence initial={false}>
                  {cart.map(({ item, qty }) => (
                    <motion.div key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}>
                      <div className="flex items-center gap-3 py-3"
                        style={{ borderBottom: '1px solid var(--border)' }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium leading-snug" style={{ color: 'var(--text)' }}>
                            {item.name}
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-35)' }}>
                            {fmt(item.price)} each
                          </p>
                        </div>
                        {/* qty stepper */}
                        <div className="flex items-center gap-2 shrink-0">
                          <motion.button whileTap={{ scale: 0.85 }} onClick={() => adjustQty(item.id, -1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: 'var(--surface-3)', color: 'var(--text-60)' }}>
                            <Minus />
                          </motion.button>
                          <span className="w-5 text-center text-sm font-semibold tabular-nums"
                            style={{ color: 'var(--text)' }}>{qty}</span>
                          <motion.button whileTap={{ scale: 0.85 }} onClick={() => adjustQty(item.id, 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: 'var(--gold-glow)', color: 'var(--gold-bright)', border: '1px solid var(--gold-border)' }}>
                            <Plus />
                          </motion.button>
                        </div>
                        <span className="text-[13px] font-semibold tabular-nums w-14 text-right shrink-0"
                          style={{ color: 'var(--gold-bright)' }}>
                          {fmt(item.price * qty)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* total + CTA */}
              <div className="px-5 pt-4 shrink-0 safe-bottom"
                style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm" style={{ color: 'var(--text-35)' }}>Total</span>
                  <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text)' }}>{fmt(totalAmt)}</span>
                </div>
                <motion.button onClick={placeOrder} whileTap={orderState === 'idle' ? { scale: 0.97 } : {}}
                  className="w-full py-[18px] rounded-2xl text-[15px] font-semibold overflow-hidden"
                  style={{
                    background: orderState === 'success'
                      ? 'linear-gradient(135deg,#16a34a,#22c55e)'
                      : 'linear-gradient(135deg,#d4920e,#e8a820,#c87c08)',
                    color: orderState === 'success' ? '#fff' : '#0d0b09',
                    boxShadow: orderState === 'success'
                      ? '0 4px 24px rgba(34,197,94,.4)'
                      : '0 4px 28px rgba(200,134,10,.4), inset 0 1px 0 rgba(255,240,160,.2)',
                    transition: 'background .35s, box-shadow .35s',
                  }}>
                  <AnimatePresence mode="wait">
                    {orderState === 'success' ? (
                      <motion.div key="ok"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2">
                        <Check /><span>Order Placed!</span>
                      </motion.div>
                    ) : (
                      <motion.span key="go" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        Place Order
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
