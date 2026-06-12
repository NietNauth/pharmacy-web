import axios from './axios'
import { Product } from '../types'

interface ChatResponse {
  session_token: string
  message_id: string
  response: string
  products?: Product[]
}

export const chatbotApi = {
  sendMessage: (message: string, sessionToken?: string) =>
    axios.post<{ response: string, session_token: string, products: any[], message_id: string }>('/chatbot/message', 
      { message }, 
      { headers: sessionToken ? { 'X-Session-Token': sessionToken } : {} }
    ).then(res => res.data.data),
  
  getHistory: (sessionToken: string) =>
    axios.get<{ data: any[] }>('/chatbot/history', { 
      headers: { 'X-Session-Token': sessionToken } 
    }).then(res => res.data.data),

  getTrending: async (): Promise<string[]> => {
    const res = await axios.get('/chatbot/trending')
    return res.data.data
  },
  getSettings: async (): Promise<{ welcome_message: string | null, suggestions: string[] }> => {
    const res = await axios.get('/chatbot/settings')
    return res.data.data
  },
  clearHistory: (sessionToken: string) =>
    axios.delete('/chatbot/history', {
      headers: { 'X-Session-Token': sessionToken }
    })
}
