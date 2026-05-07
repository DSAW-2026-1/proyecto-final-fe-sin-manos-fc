require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET','POST'] }
})

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Pasar io a los controllers
app.set('io', io)

// Socket.io — rooms por conversación
io.on('connection', (socket) => {
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId)
  })
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId)
  })
  socket.on('disconnect', () => {})
})

app.use('/api', require('./routes/index'))
app.get('/health', (_, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 4000
server.listen(PORT, () => console.log(`🚀 Backend corriendo en http://localhost:${PORT}`))
