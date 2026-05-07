import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { io } from 'socket.io-client'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'
import { convApi, SOCKET_URL } from '../api'

let socket = null

export default function Mensajes() {
  const { user } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [chats, setChats] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loadingChats, setLoadingChats] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const inputRef = useRef(null)

  // Conectar Socket.io al montar
  useEffect(() => {
    socket = io(SOCKET_URL, { transports: ['websocket'] })
    return () => { if (socket) socket.disconnect() }
  }, [])

  // Cargar lista de conversaciones
  useEffect(() => {
    convApi.list()
      .then(data => { setChats(Array.isArray(data) ? data : []); setLoadingChats(false) })
      .catch(() => setLoadingChats(false))
  }, [])

  // Si venimos desde ProductDetail con conversationId, abrir esa conv
  useEffect(() => {
    if (location.state?.conversationId && chats.length > 0) {
      const conv = chats.find(c => c.conversationId === location.state.conversationId)
      if (conv) openConversation(conv)
    }
  }, [location.state, chats])

  // Escuchar mensajes en tiempo real
  useEffect(() => {
    if (!socket || !activeConv) return
    socket.emit('join_conversation', activeConv.conversationId)
    socket.on('new_message', (msg) => {
      if (msg.conversationId === activeConv.conversationId) {
        setMessages(prev => {
          if (prev.find(m => m.message_id === msg.messageId)) return prev
          return [...prev, { message_id: msg.messageId, sender_id: msg.senderId, content: msg.content, created_at: msg.createdAt }]
        })
      }
    })
    return () => {
      socket.emit('leave_conversation', activeConv.conversationId)
      socket.off('new_message')
    }
  }, [activeConv])

  // Auto-scroll al fondo
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [messages])

  const openConversation = async (conv) => {
    setActiveConv(conv)
    setLoadingMsgs(true)
    setMessages([])
    const data = await convApi.getMessages(conv.conversationId)
    setMessages(Array.isArray(data) ? data : [])
    setLoadingMsgs(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const sendMessage = async () => {
    if (!input.trim() || !activeConv || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)
    // Optimistic update
    const tempMsg = { message_id: 'temp-' + Date.now(), sender_id: user.userId, content, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, tempMsg])
    const res = await convApi.sendMessage(activeConv.conversationId, content)
    setSending(false)
    if (res.ok) {
      // Reemplazar temp con el real
      setMessages(prev => prev.map(m => m.message_id === tempMsg.message_id
        ? { message_id: res.data.messageId, sender_id: res.data.senderId, content: res.data.content, created_at: res.data.createdAt }
        : m
      ))
      // Actualizar último mensaje en la lista
      setChats(prev => prev.map(c =>
        c.conversationId === activeConv.conversationId
          ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() }
          : c
      ))
    }
  }

  const handleDeleteConversation = async () => {
    if (!activeConv) return
    setDeleting(true)
    await convApi.deleteConversation(activeConv.conversationId)
    setDeleting(false)
    setConfirmDelete(false)
    setActiveConv(null)
    setMessages([])
    setChats(prev => prev.filter(c => c.conversationId !== activeConv.conversationId))
  }

  const formatTime = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="page-container" style={{ paddingBottom: 0 }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--navy)', marginBottom: 20 }}>Mensajes</h1>

        <div className='chat-grid' style={{ display: 'grid', gridTemplateColumns: '300px 1fr', background: 'var(--white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-100)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', height: 'calc(100dvh - 200px)' }}>

          {/* Lista de chats */}
          <div className='chat-list-panel' style={{ borderRight: '1px solid var(--gray-100)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 14, borderBottom: '1px solid var(--gray-100)', flexShrink: 0 }}>
              <input className="input-field" style={{ fontSize: 13 }} placeholder="Buscar conversación..." />
            </div>

            {loadingChats ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>Cargando...</div>
            ) : chats.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>
                <p style={{ fontSize: 28, marginBottom: 8 }}>💬</p>
                <p style={{ fontSize: 13 }}>No tienes conversaciones aún</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Contacta a un vendedor desde un producto</p>
              </div>
            ) : chats.map(c => (
              <button key={c.conversationId} onClick={() => openConversation(c)}
                style={{
                  width: '100%', textAlign: 'left', padding: '14px 16px',
                  background: activeConv?.conversationId === c.conversationId ? 'rgba(13,43,107,0.05)' : 'transparent',
                  borderLeft: activeConv?.conversationId === c.conversationId ? '3px solid var(--navy)' : '3px solid transparent',
                  border: 'none', borderBottom: '1px solid var(--gray-100)',
                  cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center',
                  fontFamily: 'var(--font-body)'
                }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--navy)', flexShrink: 0 }}>
                  {c.otherUser?.name?.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{c.otherUser?.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--gray-400)', flexShrink: 0 }}>{c.lastMessageAt ? formatTime(c.lastMessageAt) : ''}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--gold)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.productTitle}</p>
                  <p style={{ fontSize: 12, color: 'var(--gray-400)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage || 'Sin mensajes aún'}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Ventana de chat */}
          {activeConv ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, position: 'relative' }}>
              {/* Header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>
                  {activeConv.otherUser?.name?.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>{activeConv.otherUser?.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--gold)' }}>📦 {activeConv.productTitle}</p>
                </div>
                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{ background: 'none', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', padding: '5px 10px', fontSize: 12, color: 'var(--danger)', cursor: 'pointer', fontFamily: 'var(--font-body)', flexShrink: 0 }}>
                  Eliminar
                </button>
              </div>

              {/* Modal de confirmación */}
              {confirmDelete && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, borderRadius: 'var(--radius-xl)' }}>
                  <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, maxWidth: 320, width: '100%', margin: '0 16px', boxShadow: 'var(--shadow-lg)' }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 8 }}>¿Eliminar conversación?</p>
                    <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 20 }}>Se eliminarán todos los mensajes. Esta acción no se puede deshacer.</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setConfirmDelete(false)} className="btn-outline" style={{ flex: 1, padding: '9px 0' }} disabled={deleting}>Cancelar</button>
                      <button onClick={handleDeleteConversation} style={{ flex: 1, padding: '9px 0', background: 'var(--danger)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }} disabled={deleting}>
                        {deleting ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensajes */}
              <div ref={messagesContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--gray-50)', minHeight: 0 }}>
                {loadingMsgs ? (
                  <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '40px 0' }}>Cargando mensajes...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '40px 0' }}>
                    <p style={{ fontSize: 28, marginBottom: 8 }}>👋</p>
                    <p style={{ fontSize: 13 }}>¡Inicia la conversación!</p>
                  </div>
                ) : messages.map(msg => {
                  const isMe = msg.sender_id === user.userId
                  return (
                    <div key={msg.message_id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '70%', padding: '10px 14px',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMe ? 'var(--navy)' : 'var(--white)',
                        color: isMe ? 'var(--white)' : 'var(--gray-800)',
                        boxShadow: 'var(--shadow-sm)',
                        border: isMe ? 'none' : '1px solid var(--gray-100)',
                        opacity: msg.message_id?.startsWith('temp-') ? 0.7 : 1
                      }}>
                        <p style={{ fontSize: 13, lineHeight: 1.5 }}>{msg.content}</p>
                        <p style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 10, flexShrink: 0, background: 'var(--white)' }}>
                <input
                  ref={inputRef}
                  className="input-field"
                  style={{ flex: 1, fontSize: 13 }}
                  placeholder="Escribe un mensaje..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  maxLength={1000}
                />
                <button onClick={sendMessage} className="btn-primary" style={{ padding: '10px 18px', flexShrink: 0 }} disabled={!input.trim() || sending}>
                  {sending ? '...' : 'Enviar'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--gray-400)' }}>
              <span style={{ fontSize: 48, marginBottom: 16 }}>💬</span>
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 6 }}>Tus conversaciones</p>
              <p style={{ fontSize: 13 }}>Selecciona un chat o contacta a un vendedor desde un producto</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
