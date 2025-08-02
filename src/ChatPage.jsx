import { useState } from 'react'

function ChatPage({ onBack }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your nutrition assistant. I can help you log meals, analyze your nutrition intake, and provide personalized insights. What would you like to do today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 2,
      type: 'user',
      content: "I had oatmeal with berries and a banana for breakfast",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 3,
      type: 'bot',
      content: "Great! I've logged your breakfast. Here's what I found:\n\n• Oatmeal: ~150 calories, 5g protein, 27g carbs, 3g fiber\n• Mixed berries: ~40 calories, 1g protein, 10g carbs, 2g fiber\n• Banana: ~105 calories, 1g protein, 27g carbs, 3g fiber\n\nTotal: ~295 calories, 7g protein, 64g carbs, 8g fiber\n\nThis is a healthy, balanced breakfast! The fiber will help keep you full, and the natural sugars provide good energy. Would you like me to log this meal?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages([...messages, newMessage])
    setInputMessage('')

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: "I understand you're sharing information about your meal. I'm here to help you track your nutrition and provide insights. What specific details would you like me to analyze?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botResponse])
    }, 1000)
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
              />
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
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
              onClick={() => setInputMessage(suggestion)}
              className="bg-white text-green-600 border border-green-200 px-4 py-2 rounded-full text-sm hover:bg-green-50 transition-colors duration-200"
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