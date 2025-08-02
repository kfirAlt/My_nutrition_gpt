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
    <div className="min-h-screen bg-green-50">
      {currentView === 'auth' ? (
        <AuthForm 
          onNavigateToSignup={handleNavigateToSignup} 
          onLoginSuccess={handleLoginSuccess}
        />
      ) : currentView === 'signup' ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <CompleteSignupForm 
              initialData={signupData} 
              onBack={handleBackToAuth} 
            />
          </div>
        </div>
      ) : currentView === 'home' ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <HomePage 
              user={user} 
              onLogout={handleLogout} 
            />
          </div>
        </div>
      ) : null}
    </div>
  )
  
}

export default App