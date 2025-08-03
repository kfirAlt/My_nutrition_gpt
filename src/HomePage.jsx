import { supabase } from './supabaseClient.js'
import { useEffect, useState } from 'react'

function HomePage({ user, onLogout, onNavigateToChat, onNavigateToHistory, onNavigateToGraphs, onNavigateToSettings }) {
  const [firstName, setFirstName] = useState('')

  useEffect(() => {
    const fetchFirstName = async () => {
      const { data } = await supabase
        .from('User')
        .select('first_name')
        .eq('id', user.id)
        .single()

      if (data?.first_name) {
        setFirstName(data.first_name)
      }
    }

    if (user?.id) {
      fetchFirstName()
    }
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-r flex flex-col justify-between">
      {/* Header */}
      <header className="pt-8">
        <div className="flex justify-center">
          <div className="flex items-center">
            <div className="w-10 h-10 mr-2">
              <div className="grid grid-cols-3 grid-rows-3 gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
                ))}
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">My Nutrition GPT</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-6 pb-12">
        <div className="text-center max-w-6xl w-full mt-8">
          <h2 className="text-6xl font-extrabold mb-2 text-green-900 mt-6">
            Welcome {firstName}!
          </h2>
          <p className="text-2xl text-gray-700 mb-12">
            Start your journey to better health, our AI-powered nutrition assistant is here to help you.
          </p>

          <div className="bg-white rounded-3xl shadow-xl px-16 py-20 max-w-6xl mx-auto w-full min-h-[520px] flex flex-col justify-between">
            <div>
              <h3 className="text-5xl font-semibold mb-8">Let's talk about your meals</h3>
              <p className="text-2xl text-gray-600 mb-10">Let our AI analyze your nutrition intake</p>
              <button 
                onClick={onNavigateToChat}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-8 px-40 rounded-xl text-xl transition-all duration-200 shadow-md hover:shadow-lg mb-16"
              >
                Add a Meal
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-auto">
              {[
                { title: 'Graphs', desc: 'Watch your progress', onClick: onNavigateToGraphs },
                { title: 'History', desc: 'History of your meals', onClick: onNavigateToHistory },
                { title: 'Settings', desc: 'Watch or change your settings', onClick: onNavigateToSettings },
              ].map((item, i) => (
                <div key={i} className="text-center px-6">
                  <button 
                    onClick={item.onClick}
                    className="w-full text-center hover:bg-gray-50 rounded-lg p-4 transition-colors duration-200"
                  >
                    <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-xl text-green-900 mb-1">{item.title}</h4>
                    <p className="text-gray-600 text-base">{item.desc}</p>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Logout Button */}
      <div className="w-full flex justify-end pr-10 pb-8">
        <div className="mr-auto w-full max-w-7xl flex justify-end">
          <button
            onClick={handleLogout}
            className="bg-green-500 text-white px-8 py-3 rounded-md hover:bg-green-600 transition duration-200 text-base"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomePage
