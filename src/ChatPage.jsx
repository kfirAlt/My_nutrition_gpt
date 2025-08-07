import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'

function ChatPage({ user, onBack }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your nutrition assistant. I can help you log meals, analyze your nutrition intake, and provide personalized insights. What would you like to do today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [clarificationId, setClarificationId] = useState(null)
  const [session, setSession] = useState(null)

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session) {
        setSession(data.session)
        console.log("Session active:", data.session)
      } else {
        console.warn("No active session")
      }
    }
    fetchSession()
  }, [])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    const trimmedInput = inputMessage.trim()
    if (!trimmedInput || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: trimmedInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      let endpoint = ''
      let body = {}

      if (clarificationId) {
        const { data: clarificationData } = await supabase
          .from('MealClarification')
          .select('answers, current_index')
          .eq('id', clarificationId)
          .single()

        const updatedAnswers = [...clarificationData.answers]
        updatedAnswers[clarificationData.current_index] = trimmedInput

        endpoint = 'https://n8n-4mn8.onrender.com/webhook/clarification_answer'
        body = {
          clarification_id: clarificationId,
          user_id: user?.id,
          answer: trimmedInput,
          answers: updatedAnswers,
          current_index: clarificationData.current_index
        }
      } else {
        const { data: clarificationData } = await supabase
          .from('MealClarification')
          .select('id')
          .eq('user_id', user?.id)
          .eq('status', 'pending')
          .maybeSingle()

        if (clarificationData) {
          setClarificationId(clarificationData.id)
        }

        endpoint = 'https://n8n-4mn8.onrender.com/webhook/chat_nutrition'
        body = {
          user_id: user?.id,
          message: trimmedInput,
          timestamp: new Date().toISOString()
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()

      if (data.clarification_id && data.question) {
        setClarificationId(data.clarification_id)
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'bot',
          content: data.question,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }])
      } else if (clarificationId) {
        if (data.next_clarification_id && data.next_question) {
          setClarificationId(data.next_clarification_id)
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            type: 'bot',
            content: data.next_question,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }])
        } else {
          setClarificationId(null)
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            type: 'bot',
            content: data.response || "Thanks! I've processed your answer.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }])
        }
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response || "Thanks! I've updated your meal info.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }])
      }
    } catch (error) {
      console.error('Error sending message to n8n:', error)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: "Sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
      setClarificationId(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (suggestion) => {
    setInputMessage(suggestion)
  }


  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* App Icon - 3x3 grid of green squares */}
              <div className="w-10 h-10 mr-3">
                <div className="grid grid-cols-3 grid-rows-3 gap-0.5">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
                  ))}
                </div>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">My Nutrition GPT</h1>
            </div>
            <button
              onClick={onBack}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium text-base"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-6 mb-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] lg:max-w-[70%] rounded-2xl px-6 py-4 shadow-sm ${
                  message.type === 'user'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-900 border border-green-100'
                }`}
              >
                <div className="whitespace-pre-wrap text-base leading-relaxed">
                  {message.content}
                </div>
                <div
                  className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-green-100' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] lg:max-w-[70%] rounded-2xl px-6 py-4 shadow-sm bg-white text-gray-900 border border-green-100">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                  <span className="text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-4">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tell me about your meal or ask me anything about nutrition..."
                className="w-full resize-none border-0 focus:ring-0 focus:outline-none text-base leading-relaxed placeholder-gray-400"
                rows="1"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            "Log my breakfast",
            "What should I eat for lunch?",
            "Analyze my nutrition today",
            "Give me healthy snack ideas"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(suggestion)}
              disabled={isLoading}
              className="bg-white text-green-600 border border-green-200 px-4 py-2 rounded-full text-sm hover:bg-green-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChatPage