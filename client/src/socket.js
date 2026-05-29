import { io } from 'socket.io-client'

// When VITE_SOCKET_URL is unset, socket.io-client connects to window.location.origin
// (Vite proxy forwards /socket.io → localhost:3001 in development)
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
})

socket.on('connect', () => console.log('[socket] connected', socket.id))
socket.on('disconnect', () => console.log('[socket] disconnected'))

export default socket
