const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const QRCode = require('qrcode')
const { v4: uuidv4 } = require('uuid')

const app = express()
const server = createServer(app)

const PORT = process.env.PORT || 3001
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
const MENU_BASE_URL = process.env.MENU_BASE_URL || 'http://localhost:5173'

const allowedOrigins = CLIENT_URL.split(',').map(s => s.trim())

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

// In-memory order store
let orders = []

app.get('/api/orders', (req, res) => {
  const { type } = req.query
  let result = orders.filter(o => o.status === 'pending')
  if (type === 'food' || type === 'drink') {
    result = result.filter(o => o.items[0]?.category === type)
  }
  res.json(result)
})

app.get('/api/qr/:tableId', async (req, res) => {
  const { tableId } = req.params
  const url = `${MENU_BASE_URL}/table/${tableId}`
  try {
    const buffer = await QRCode.toBuffer(url, {
      type: 'png',
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.send(buffer)
  } catch (err) {
    console.error('QR generation failed:', err)
    res.status(500).json({ error: 'Failed to generate QR code' })
  }
})

io.on('connection', (socket) => {
  console.log(`[socket] connected: ${socket.id}`)

  // Send all currently pending orders so late-joining kitchen/bar tabs catch up
  const pending = orders.filter(o => o.status === 'pending')
  pending.forEach(o => {
    const event = o.items[0]?.category === 'food' ? 'new_food_order' : 'new_drink_order'
    socket.emit(event, o)
  })
  if (pending.length) console.log(`[socket] replayed ${pending.length} pending order(s) to ${socket.id}`)

  socket.on('place_order', ({ tableId, items }) => {
    const sharedOrderId = uuidv4()
    const timestamp = new Date().toISOString()

    const foodItems = items.filter(i => i.category === 'food')
    const drinkItems = items.filter(i => i.category === 'drink')

    if (foodItems.length > 0) {
      const foodOrder = {
        id: uuidv4(),
        orderId: sharedOrderId,
        tableId,
        items: foodItems,
        status: 'pending',
        timestamp,
      }
      orders.push(foodOrder)
      io.emit('new_food_order', foodOrder)
      console.log(`[order] food → table ${tableId} (${foodItems.length} items)`)
    }

    if (drinkItems.length > 0) {
      const drinkOrder = {
        id: uuidv4(),
        orderId: sharedOrderId,
        tableId,
        items: drinkItems,
        status: 'pending',
        timestamp,
      }
      orders.push(drinkOrder)
      io.emit('new_drink_order', drinkOrder)
      console.log(`[order] drinks → table ${tableId} (${drinkItems.length} items)`)
    }
  })

  socket.on('mark_ready', ({ orderId, tableId }) => {
    const order = orders.find(o => o.id === orderId)
    if (order) order.status = 'ready'
    io.emit('order_ready', {
      orderId,
      tableId,
      timestamp: new Date().toISOString(),
    })
    console.log(`[order] ready → table ${tableId}`)
  })

  socket.on('disconnect', () => {
    console.log(`[socket] disconnected: ${socket.id}`)
  })
})

server.listen(PORT, () => {
  console.log(`RestaurantOS server running on http://localhost:${PORT}`)
  console.log(`Client origin: ${allowedOrigins.join(', ')}`)
  console.log(`Menu base URL: ${MENU_BASE_URL}`)
})
