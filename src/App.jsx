import { useState } from 'react'
import AuthForm from './AuthForm.jsx'
import CompleteSignupForm from './CompleteSignupForm.jsx'
import HomePage from './HomePage.jsx'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {currentView === 'auth' ? (
          <AuthForm 
            onNavigateToSignup={handleNavigateToSignup} 
            onLoginSuccess={handleLoginSuccess}
          />
        ) : currentView === 'signup' ? (
          <CompleteSignupForm 
            initialData={signupData} 
            onBack={handleBackToAuth} 
          />
        ) : currentView === 'home' ? (
          <HomePage 
            user={user} 
            onLogout={handleLogout} 
          />
        ) : null}
      </div>
    </div>
  )
}

export default App