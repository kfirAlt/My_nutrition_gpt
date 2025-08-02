import { useState } from 'react'
import AuthForm from './AuthForm.jsx'
import CompleteSignupForm from './CompleteSignupForm.jsx'
import HomePage from './HomePage.jsx'
import ChatPage from './ChatPage.jsx'
import HistoryPage from './HistoryPage.jsx'
import './index.css'

function App() {
  const [currentView, setCurrentView] = useState('auth')
  const [signupData, setSignupData] = useState(null)
  const [user, setUser] = useState(null)

  const handleNavigateToSignup = (data) => {
    setSignupData(data)
    setCurrentView('signup')
  }

  const handleBackToAuth = () => {
    setCurrentView('auth')
    setSignupData(null)
  }

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setCurrentView('home')
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentView('auth')
  }

  const handleNavigateToChat = () => {
    setCurrentView('chat')
  }

  const handleNavigateToHistory = () => {
    setCurrentView('history')
  }

  const handleBackToHome = () => {
    setCurrentView('home')
  }

  return (
    <div className="min-h-screen">
      {currentView === 'auth' ? (
        <AuthForm 
          onNavigateToSignup={handleNavigateToSignup} 
          onLoginSuccess={handleLoginSuccess}
        />
      ) : currentView === 'signup' ? (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <CompleteSignupForm 
              initialData={signupData} 
              onBack={handleBackToAuth} 
            />
          </div>
        </div>
      ) : currentView === 'home' ? (
        <div className="min-h-screen bg-gradient-to-r from-green-50 to-green-100">
          <HomePage 
            user={user} 
            onLogout={handleLogout}
            onNavigateToChat={handleNavigateToChat}
            onNavigateToHistory={handleNavigateToHistory}
          />
        </div>
      ) : currentView === 'chat' ? (
        <ChatPage 
          onBack={handleBackToHome}
        />
      ) : currentView === 'history' ? (
        <HistoryPage 
          user={user}
          onBack={handleBackToHome}
        />
      ) : null}
    </div>
  )
}

export default App
