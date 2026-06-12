import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Sparkles, MessageSquare, AlertCircle, RefreshCw, Trash2, ArrowRight, AlertTriangle } from 'lucide-react'
import { chatbotApi } from '../api/chatbot'
import { PageWrapper } from '../components/layout/PageWrapper'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { toast } from 'react-hot-toast'
import { cn } from '../utils/cn'
import { formatCurrency } from '../utils/format'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  products?: any[]
  created_at: Date
}

const renderMessageContent = (content: string, role: 'user' | 'assistant') => {
  if (!content) return null
  
  const lines = content.split('\n')
  
  return lines.map((line, lineIndex) => {
    let cleanLine = line
    let isBullet = false
    
    if (line.trim().startsWith('- ')) {
      isBullet = true
      cleanLine = line.trim().substring(2)
    } else if (line.trim().startsWith('* ')) {
      if (!line.trim().startsWith('**')) {
        isBullet = true
        cleanLine = line.trim().substring(2)
      }
    }
    
    const parts: React.ReactNode[] = []
    let currentIdx = 0
    const boldRegex = /\*\*(.*?)\*\*/g
    let match
    
    while ((match = boldRegex.exec(cleanLine)) !== null) {
      const matchIndex = match.index
      if (matchIndex > currentIdx) {
        parts.push(cleanLine.substring(currentIdx, matchIndex))
      }
      parts.push(
        <strong 
          key={`bold-${matchIndex}`} 
          className={cn(
            "font-extrabold", 
            role === 'user' ? "text-white" : "text-text-primary"
          )}
        >
          {match[1]}
        </strong>
      )
      currentIdx = boldRegex.lastIndex
    }
    
    if (currentIdx < cleanLine.length) {
      parts.push(cleanLine.substring(currentIdx))
    }
    
    const contentNode = isBullet ? (
      <span className="flex items-start gap-2 pl-4 my-1">
        <span className={cn(
          "mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full",
          role === 'user' ? "bg-white" : "bg-primary"
        )} />
        <span>{parts}</span>
      </span>
    ) : (
      parts
    )
    
    return (
      <React.Fragment key={lineIndex}>
        {lineIndex > 0 && !isBullet && <br />}
        {contentNode}
      </React.Fragment>
    )
  })
}

const getProductPrice = (p: any) => {
  if (p.current_price !== undefined && p.current_price !== null) return p.current_price
  if (p.sale_price !== undefined && p.sale_price !== null) return p.sale_price
  if (p.base_price !== undefined && p.base_price !== null) return p.base_price
  if (p.price !== undefined && p.price !== null) return p.price
  return 0
}

const getProductImage = (p: any) => {
  return p.primary_image || p.image_url || '/placeholder.png'
}

export const ConsultantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(
    localStorage.getItem('pharma_chatbot_session')
  )
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  useEffect(() => {
    if (sessionToken) {
      chatbotApi.getHistory(sessionToken).then(history => {
        if (history && history.length > 0) {
          const formattedHistory = history.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            products: m.products,
            created_at: new Date(m.created_at)
          }))
          setMessages(formattedHistory)
        }
      })
    }
  }, [sessionToken])

  const handleSend = async () => {
    if (!message.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      created_at: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentMessage = message
    setMessage('')
    setIsLoading(true)

    try {
      const res = await chatbotApi.sendMessage(currentMessage, sessionToken || undefined)
      
      if (res.session_token) {
        setSessionToken(res.session_token)
        localStorage.setItem('pharma_chatbot_session', res.session_token)
      }

      const botMessage: Message = {
        id: res.message_id,
        role: 'assistant',
        content: res.response,
        products: res.products,
        created_at: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const confirmClearHistory = async () => {
    if (!sessionToken) return
    setIsClearing(true)
    try {
      await chatbotApi.clearHistory(sessionToken)
      setMessages([])
      setIsClearModalOpen(false)
      toast.success('Đã làm mới cuộc trò chuyện')
    } catch (error) {
      toast.error('Không thể xóa lịch sử')
    } finally {
      setIsClearing(false)
    }
  }

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null)
  const [isSettingsLoading, setIsSettingsLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await chatbotApi.getSettings()
        if (settings.welcome_message) {
          setWelcomeMessage(settings.welcome_message)
        }
        if (settings.suggestions && settings.suggestions.length > 0) {
          setSuggestions(settings.suggestions.slice(0, 4))
        }
      } catch (error) {
        console.error('Failed to fetch settings', error)
      } finally {
        // Fallback for suggestions if settings didn't have any
        chatbotApi.getTrending().then(questions => {
          if (questions && questions.length > 0 && suggestions.length === 0) {
            setSuggestions(questions.slice(0, 4))
          }
          setIsSettingsLoading(false)
        })
      }
    }

    fetchSettings()
  }, [])

  return (
    <PageWrapper maxWidth="xl" className="py-0 md:py-8 h-[calc(100vh-110px)] md:h-[calc(100vh-100px)] flex flex-col overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-8 flex-1 h-full overflow-hidden">
        
        {/* Left Column: Info & Suggestions - Hidden on Mobile */}
        <div className="hidden lg:block lg:w-1/3 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-border overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Bot size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-text-primary leading-tight">Chat với Dược sĩ</h1>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">Hệ thống tư vấn thông minh</p>
              </div>
            </div>
            
            <p className="text-sm text-text-secondary leading-relaxed mb-8">
              Hệ thống trí tuệ nhân tạo được huấn luyện dựa trên danh mục thuốc của PharmaVN để cung cấp thông tin chính xác và nhanh chóng nhất.
            </p>

            <div className="space-y-4">
              {[
                { icon: <RefreshCw size={16} />, text: 'Hỗ trợ trực tuyến 24/7' },
                { icon: <MessageSquare size={16} />, text: 'Ghi nhớ lịch sử tư vấn' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-bold text-text-primary">
                  <div className="w-8 h-8 bg-bg-subtle rounded-xl flex items-center justify-center text-primary/60">
                    {item.icon}
                  </div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-border">
            <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-6">Gợi ý cho bạn</h3>
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => { setMessage(s); }}
                  className="w-full text-left p-4 bg-bg-subtle hover:bg-white border border-transparent hover:border-primary/20 rounded-2xl transition-all group"
                >
                  <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{s}</p>
                </button>
              ))}
              {suggestions.length === 0 && (
                <div className="py-8 flex flex-col items-center justify-center gap-3 opacity-40">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Đang tải gợi ý</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chat Interface */}
        <div className="flex-1 flex flex-col bg-white md:rounded-[40px] shadow-sm md:border border-border overflow-hidden relative min-h-0">
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-border bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                <Bot size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-text-primary">Trò chuyện với Dược sĩ</h2>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Đang trực tuyến</span>
                </div>
              </div>
            </div>
            
            {messages.length > 0 && (
              <button 
                onClick={() => setIsClearModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 size={14} />
                Làm mới cuộc trò chuyện
              </button>
            )}
          </div>

          {/* Messages Area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 bg-[var(--bg-subtle)]/30 custom-scrollbar"
          >
            {(messages.length === 0 && !isLoading) && (
              <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="w-10 h-10 rounded-2xl bg-white text-primary flex items-center justify-center shrink-0 shadow-sm border border-border">
                  <Bot size={20} />
                </div>
                <div className="max-w-[80%]">
                  <div className="p-5 rounded-3xl bg-white text-text-primary border border-border rounded-tl-none shadow-sm leading-relaxed text-sm font-medium min-w-[100px]">
                    {isSettingsLoading ? (
                      <div className="flex gap-1.5 items-center py-2 px-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      </div>
                    ) : (
                      <>
                        {welcomeMessage ? (
                          renderMessageContent(welcomeMessage, 'assistant')
                        ) : (
                          <>
                            Chào bạn! Tôi là Dược sĩ Trực tuyến của nhà thuốc PharmaVN. 
                            Tôi luôn sẵn sàng hỗ trợ tư vấn về thuốc, cách sử dụng và các giải pháp chăm sóc sức khỏe phù hợp nhất cho bạn.
                            <br /><br />
                            Hôm nay bạn cần tôi giúp gì không ạ?
                          </>
                        )}
                        <div className="text-[10px] mt-2 opacity-50 font-bold text-text-muted">
                          Vừa xong
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div 
                key={m.id || `msg-${i}`}
                className={cn(
                  "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  m.role === 'user' ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border",
                  m.role === 'user' 
                    ? "bg-primary text-white border-primary" 
                    : "bg-white text-primary border-border"
                )}>
                  {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                
                <div className={cn(
                  "max-w-[80%] space-y-3",
                  m.role === 'user' ? "text-right" : ""
                )}>
                  <div className={cn(
                    "p-5 rounded-3xl shadow-sm leading-relaxed text-sm font-medium",
                    m.role === 'user' 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-white text-text-primary border border-border rounded-tl-none"
                  )}>
                    {renderMessageContent(m.content, m.role)}
                    <div className={cn(
                      "text-[10px] mt-2 opacity-50 font-bold",
                      m.role === 'user' ? "text-white" : "text-text-muted"
                    )}>
                      {m.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {m.products && m.products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {m.products.map((p: any, i: number) => (
                        <a 
                          key={`${p.id}-${p.slug}-${i}`}
                          href={`/products/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-white border border-border rounded-2xl hover:border-primary/30 hover:shadow-md transition-all group"
                        >
                          <div className="w-12 h-12 bg-bg-subtle rounded-xl flex-shrink-0 overflow-hidden">
                            <img src={getProductImage(p)} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-text-primary truncate mb-0.5">{p.name}</p>
                            <p className="text-[10px] font-black text-primary font-mono">
                              {getProductPrice(p) > 0 ? formatCurrency(Number(getProductPrice(p))) : 'Liên hệ'}
                            </p>
                          </div>
                          <ArrowRight size={14} className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm border border-primary/10">
                  <Bot size={20} className="animate-pulse" />
                </div>
                <div className="bg-white border border-border p-5 rounded-3xl rounded-tl-none shadow-sm space-y-3 min-w-[200px]">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary animate-pulse">
                    <Sparkles size={14} />
                    <span>Dược sĩ đang phân tích câu hỏi...</span>
                  </div>
                  <div className="flex gap-1.5 items-center px-1">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-border shrink-0">
            <div className="relative max-w-4xl mx-auto">
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Đặt câu hỏi cho dược sĩ của bạn..."
                className="w-full bg-white border border-border rounded-3xl px-6 py-4 pr-16 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm resize-none max-h-40 min-h-[60px] text-text-primary"
                rows={1}
              />
              <button 
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className={cn(
                  'absolute right-3 bottom-3 w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-lg',
                  message.trim() && !isLoading ? 'bg-primary text-white shadow-primary/20' : 'bg-gray-200 text-text-muted cursor-not-allowed'
                )}
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-[10px] text-text-muted text-center mt-4 font-bold uppercase tracking-widest">
              Lưu ý: Hệ thống hỗ trợ tự động có thể có sai sót. Vui lòng tham khảo ý kiến bác sĩ cho các vấn đề sức khỏe nghiêm trọng.
            </p>
          </div>
        </div>

      </div>

      {/* Custom Clear History Modal using System ConfirmModal */}
      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={confirmClearHistory}
        title="Làm mới cuộc trò chuyện"
        description="Toàn bộ nội dung trò chuyện hiện tại sẽ bị xóa vĩnh viễn. Bạn có chắc chắn muốn bắt đầu một cuộc hội thoại mới không?"
        variant="danger"
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        loading={isClearing}
      />
    </PageWrapper>
  )
}
