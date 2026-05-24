import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import socket from '../socket'

const fmtTime = iso => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

export default function WaiterPage() {
  const [notes, setNotes] = useState([])

  useEffect(() => {
    const handler = d => setNotes(p => [{ uid: `${Date.now()}-${Math.random()}`, ...d }, ...p])
    socket.on('order_ready', handler)
    return () => socket.off('order_ready', handler)
  }, [])

  const dismiss = uid => setNotes(p => p.filter(n => n.uid !== uid))

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── header ─────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-8 py-4"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-warm)' }}>
        <div className="flex items-center gap-5">
          <div className="relative w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--gold-glow)', border: '1px solid var(--gold-border)' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <AnimatePresence>
              {notes.length > 0 && (
                <motion.span key="dot"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: '#ef4444', color: '#fff' }}>
                  {notes.length}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.24em] uppercase font-semibold" style={{ color: 'var(--gold)' }}>
              Waiter Station
            </p>
            <p className="text-lg font-semibold mt-0.5 leading-none" style={{ color: 'var(--text)' }}>
              Osteria Moderna
            </p>
          </div>
        </div>

        <AnimatePresence>
          {notes.length > 0 && (
            <motion.div key="alert"
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
              className="flex items-center gap-2 rounded-full px-4 py-2"
              style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-red-400" />
              <span className="text-sm font-semibold text-red-400">
                {notes.length} {notes.length === 1 ? 'table' : 'tables'} waiting
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── notifications ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-8">
          <AnimatePresence mode="popLayout">
            {notes.length === 0 ? (
              <motion.div key="empty"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-36 text-center gap-5">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="var(--text-18)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-35)' }}>All clear</p>
                  <p className="text-sm mt-1 max-w-xs" style={{ color: 'var(--text-18)' }}>
                    Ready order notifications appear here when the kitchen marks an order
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <p className="text-[9px] tracking-[0.22em] uppercase font-semibold mb-4"
                  style={{ color: 'var(--text-18)' }}>Ready for pickup</p>
                <AnimatePresence mode="popLayout">
                  {notes.map(n => (
                    <motion.div key={n.uid} layout
                      initial={{ opacity: 0, y: -14, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 50, scale: 0.95, transition: { duration: 0.2 } }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="flex items-center gap-4 rounded-2xl p-4"
                      style={{
                        background: 'rgba(34,197,94,.06)',
                        border: '1px solid rgba(34,197,94,.22)',
                        boxShadow: '0 0 32px rgba(34,197,94,.06)',
                      }}>

                      {/* table number block */}
                      <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(34,197,94,.12)', border: '1px solid rgba(34,197,94,.28)' }}>
                        <span className="font-serif font-bold text-2xl tabular-nums text-green-400">
                          {n.tableId}
                        </span>
                      </div>

                      {/* info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[15px]" style={{ color: 'var(--text)' }}>
                          Table {n.tableId}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 4 12 14.01l-3-3" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="text-sm font-medium text-green-400">Ready for pickup</span>
                          <span style={{ color: 'var(--text-18)' }}>·</span>
                          <span className="text-sm tabular-nums" style={{ color: 'var(--text-35)' }}>{fmtTime(n.timestamp)}</span>
                        </div>
                      </div>

                      {/* dismiss */}
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => dismiss(n.uid)}
                        className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold"
                        style={{ background: 'rgba(34,197,94,.14)', color: '#4ade80', border: '1px solid rgba(34,197,94,.28)' }}>
                        Collected
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
