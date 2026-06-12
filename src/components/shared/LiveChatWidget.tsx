import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, X, Send, User, ChevronRight, Headphones, Loader2, Image as ImageIcon, Paperclip } from 'lucide-react'
import { cn } from '../../utils/cn'
import { chatApi, Message, Conversation } from '../../api/chat'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { LoginModal } from '../auth/LoginModal'

export const LiveChatWidget = () => {
  const { isAuthenticated, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollingInterval = useRef<any>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = useCallback(async (id: string) => {
    try {
      const response = await chatApi.getMessages(id)
      if (response.data.success) {
        setMessages(response.data.data.messages)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }, [])

  const initChat = async () => {
    if (!isAuthenticated) return
    
    setIsLoading(true)
    try {
      const response = await chatApi.startConversation()
      if (response.data.success) {
        setConversation(response.data.data)
        await fetchMessages(response.data.data.id)
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      initChat()
    } else {
      setConversation(null)
      setMessages([])
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
      }
    }
  }, [isOpen, isAuthenticated])

  useEffect(() => {
    if (conversation && isOpen) {
      pollingInterval.current = setInterval(() => {
        fetchMessages(conversation.id)
      }, 5000)
    }
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
      }
    }
  }, [conversation, isOpen, fetchMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSend = async () => {
    if ((!message.trim() && !selectedFile) || !conversation || isSending) return

    const body = message.trim()
    const file = selectedFile
    
    setMessage('')
    setSelectedFile(null)
    setPreviewUrl(null)
    setIsSending(true)
    
    try {
      const response = await chatApi.sendMessage(conversation.id, body, file || undefined)
      if (response.data.success) {
        setMessages(prev => [...prev, response.data.data])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessage(body) // Restore message on failure
    } finally {
      setIsSending(false)
    }
  }

  const toggleChat = () => {
    if (!isAuthenticated && !isOpen) {
      setIsLoginModalOpen(true)
      return
    }
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const handleOpenChat = () => {
      if (!isAuthenticated) {
        setIsLoginModalOpen(true)
      } else {
        setIsOpen(true)
      }
    }
    window.addEventListener('open-live-chat', handleOpenChat)
    return () => window.removeEventListener('open-live-chat', handleOpenChat)
  }, [isAuthenticated])

  return (
    <>
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => setIsOpen(true)}
      />
      
      <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-[999] flex flex-col items-end gap-4">
      {/* Chat Panel */}
      {isOpen && (
        <div className={cn(
          'bg-white border border-border shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300',
          'fixed inset-0 md:static md:w-[380px] md:h-[560px] md:rounded-3xl'
        )}>
          {/* Header */}
          <div className="bg-primary p-4 flex items-center justify-between text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md text-white">
                <Headphones size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider leading-none">Dược Sĩ Trực Tuyến</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-white/80">Sẵn sàng hỗ trợ</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-bg-subtle/30">
            {!isAuthenticated ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-bg-subtle rounded-full flex items-center justify-center text-text-muted mb-4">
                  <User size={32} />
                </div>
                <h4 className="font-bold text-text-primary mb-2">Yêu cầu đăng nhập</h4>
                <p className="text-xs text-text-muted mb-4">Vui lòng đăng nhập để có thể chat trực tiếp với dược sĩ của chúng tôi.</p>
                <Button 
                  size="sm" 
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  Đăng nhập ngay
                </Button>
              </div>
            ) : isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <>
                {messages.length === 0 && (
                  <div className="text-center p-6">
                    <p className="text-xs text-text-muted">Chào {user?.full_name || 'bạn'}! Tôi là dược sĩ trực ca. Bạn cần hỗ trợ gì không?</p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div 
                    key={`${msg.id}-${idx}`} 
                    className={cn('flex flex-col', msg.sender_id === user?.id ? 'items-end' : 'items-start')}
                  >
                    <div className={cn(
                      'max-w-[85%] p-3 px-4 rounded-2xl text-sm leading-relaxed shadow-sm overflow-hidden',
                      msg.sender_id === user?.id 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white text-text-primary rounded-tl-none border border-border'
                    )}>
                      {msg.type === 'image' && msg.attachment_url && (
                        <div className="mb-2 -mx-1 -mt-1">
                          <img 
                            src={msg.attachment_url} 
                            alt="Attachment" 
                            className="w-full h-auto rounded-xl object-cover max-h-60"
                            onClick={() => window.open(msg.attachment_url, '_blank')}
                          />
                        </div>
                      )}
                      {msg.type === 'file' && msg.attachment_url && (
                        <a 
                          href={msg.attachment_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 p-2 bg-black/5 rounded-lg mb-2 hover:bg-black/10 transition-colors"
                        >
                          <Paperclip size={16} />
                          <span className="text-xs truncate">Tệp đính kèm</span>
                        </a>
                      )}
                      {msg.body && <div>{msg.body}</div>}
                    </div>
                    <span className="text-[10px] text-text-muted mt-1 px-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-border">
            {previewUrl && (
              <div className="mb-3 relative inline-block">
                <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-border shadow-md" />
                <button 
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <div className={cn(
              "flex items-end gap-2 bg-bg-subtle rounded-2xl p-2 pl-3 border border-transparent transition-all",
              !isAuthenticated && "opacity-50 pointer-events-none"
            )}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/*,.pdf,.doc,.docx"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-text-muted hover:text-primary transition-colors mb-0.5"
                title="Đính kèm tệp"
              >
                <Paperclip size={20} />
              </button>
              <textarea 
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                disabled={!isAuthenticated || isSending}
                placeholder={isAuthenticated ? "Nhập tin nhắn..." : "Đăng nhập để chat"}
                className="flex-1 bg-transparent border-none outline-none text-sm py-2 resize-none max-h-32 min-h-[40px] text-text-primary"
                rows={1}
              />
              <button 
                onClick={handleSend}
                disabled={(!message.trim() && !selectedFile) || !isAuthenticated || isSending}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                  (message.trim() || selectedFile) && !isSending ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-200 text-text-muted'
                )}
              >
                {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={toggleChat}
        className={cn(
          'w-16 h-16 rounded-full hidden md:flex items-center justify-center shadow-2xl transition-all duration-300 relative group',
          isOpen ? 'bg-white text-text-primary rotate-90' : 'bg-rose-500 text-white hover:scale-110 active:scale-95'
        )}
      >
        {isOpen ? <X size={28} /> : (
          <>
            <MessageCircle size={32} fill="currentColor" className="animate-pulse" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            <div className="absolute right-full mr-4 bg-white px-4 py-2 rounded-xl border border-border shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none hidden md:block">
              <p className="text-sm font-bold text-text-primary">Chat với Dược sĩ</p>
            </div>
          </>
        )}
      </button>
    </div>
    </>
  )
}
