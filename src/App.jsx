import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import AuthForm from './AuthForm.jsx'
import CompleteSignupForm from './CompleteSignupForm.jsx'
import HomePage from './HomePage.jsx'
import ChatPage from './ChatPage.jsx'
import HistoryPage from './HistoryPage.jsx'
import GraphsPage from './GraphsPage.jsx'
import SettingsPage from './SettingsPage.jsx'
import './index.css'

function App() {
  const [currentView, setCurrentView] = useState('auth')
  const [signupData, setSignupData] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (data?.session?.user) {
        setUser(data.session.user)
        setCurrentView('home')
      }
    }
    checkSession()
  }, [])

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setCurrentView('auth')
  }

  const handleNavigateToChat = () => setCurrentView('chat')
  const handleNavigateToHistory = () => setCurrentView('history')
  const handleNavigateToGraphs = () => setCurrentView('graphs')
  const handleNavigateToSettings = () => setCurrentView('settings')
  const handleBackToHome = () => setCurrentView('home')

  return (
    <div className="min-h-screen">
      {currentView === 'auth' ? (
        <AuthForm
          onNavigateToSignup={handleNavigateToSignup}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : currentView === 'signup' ? (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <CompleteSignupForm
            initialData={signupData}
            onBack={handleBackToAuth}
          />
        </div>
      ) : currentView === 'home' ? (
        <div className="min-h-screen bg-gradient-to-r from-green-50 to-green-100">
          <HomePage
            user={user}
            onLogout={handleLogout}
            onNavigateToChat={handleNavigateToChat}
            onNavigateToHistory={handleNavigateToHistory}
            onNavigateToGraphs={handleNavigateToGraphs}
            onNavigateToSettings={handleNavigateToSettings}
          />
        </div>
      ) : currentView === 'chat' ? (
        <ChatPage user={user} onBack={handleBackToHome} />
      ) : currentView === 'history' ? (
        <HistoryPage user={user} onBack={handleBackToHome} />
      ) : currentView === 'graphs' ? (
        <GraphsPage user={user} onBack={handleBackToHome} />
      ) : currentView === 'settings' ? (
        <SettingsPage user={user} onBack={handleBackToHome} />
      ) : null}
    </div>
  )
}

export default App
