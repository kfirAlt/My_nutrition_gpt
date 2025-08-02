import { supabase } from './supabaseClient.js'
import { useEffect, useState } from 'react'

function HomePage({ user, onLogout }) {
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
    <div className="min-h-screen bg-green-50 flex flex-col justify-between">
      {/* Header */}
      <div className="pt-6 relative">
        <div className="flex justify-center">
          <div className="flex items-center">
            <div className="w-10 h-10 mr-2">
              <div className="grid grid-cols-3 grid-rows-3 gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
                ))}
              </div>
            </div>
            <h1 className="text-2xl font-semibold">My Nutrition GPT</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 pt-2 pb-8">
        <div className="w-full max-w-7xl text-center">
          <div className="mb-10">
            <h2 className="text-6xl font-bold mb-4">
              Welcome {firstName}!
            </h2>
            <p className="text-2xl leading-relaxed max-w-5xl mx-auto">
              Start your journey to better health, our AI-powered nutrition assistant is here to help you.
            </p>
          </div>

          {/* Central Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-20 max-w-6xl mx-auto">
            <div className="space-y-6">
              <h3 className="text-4xl font-semibold">
                Let's talk about your meals
              </h3>
              <p className="text-xl">
                Let our AI analyze your nutrition intake
              </p>
              <button className="w-full bg-green-500 text-white py-6 px-10 rounded-xl hover:bg-green-600 text-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                Add a Meal
              </button>
            </div>

            {/* Features */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-16">
              {[
                { title: 'Track Progress', desc: 'Monitor your nutrition goals' },
                { title: 'AI Insights', desc: 'Get personalized recommendations' },
                { title: 'Your Settings', desc: 'Watch or change your settings' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2 text-xl">{item.title}</h4>
                  <p className="text-lg">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button at Bottom */}
      <div className="w-full flex justify-end px-6 pb-6">
        <button
          onClick={handleLogout}
          className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors duration-200 text-base"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default HomePage
