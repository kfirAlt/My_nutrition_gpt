AuthForm.jsx

import { useState } from 'react'
import { supabase } from './supabaseClient.js'

function AuthForm({ onNavigateToSignup, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage('Invalid email or password. Please try again or create a new account.')
      } else {
        setMessage('Sign in successful!')
        setEmail('')
        setPassword('')

        setTimeout(() => {
          onLoginSuccess(data.user)
        }, 1000)
      }
    } catch (error) {
      setMessage('Invalid email or password. Please try again or create a new account.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = () => {
    onNavigateToSignup({ email, password })
  }

  return (
    <div className="min-h-screen w-full bg-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-10">
            <div className="w-16 h-16 mr-6">
              <div className="grid grid-cols-3 grid-rows-3 gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-green-500 rounded-sm"></div>
                ))}
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold">My Nutrition GPT</h1>
          </div>
          <h2 className="text-3xl md:text-6xl font-bold">Good to see you again</h2>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full">
          <form onSubmit={handleSignIn} className="space-y-12">
            <div>
              <label htmlFor="email" className="block text-xl md:text-2xl font-medium mb-4">
                Your email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 md:h-8 md:w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-16 pr-6 py-6 md:py-8 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg md:text-2xl"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xl md:text-2xl font-medium mb-4">
                Your password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 md:h-8 md:w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-16 pr-6 py-6 md:py-8 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg md:text-2xl"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white py-6 md:py-8 px-10 rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-2xl md:text-3xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="flex flex-col space-y-8 mt-16">
            <button 
              onClick={handleCreateAccount}
              className="text-green-600 hover:text-green-700 text-xl md:text-2xl font-medium text-center transition-colors duration-200"
            >
              Don't have an account?
            </button>
          </div>

          {message && (
            <div className={`mt-10 p-6 rounded-xl ${
              message.includes('Invalid') || message.includes('Error') 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthForm
