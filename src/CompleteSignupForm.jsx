import { useState } from 'react'
import { supabase } from './supabaseClient.js'

function CompleteSignupForm({ initialData, onBack }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: initialData?.email || '',
    password: initialData?.password || '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    setMessage('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        setMessage(`Authentication Error: ${authError.message}`)
        setLoading(false)
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('User')
        .insert([{
          id: authData.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          age: parseInt(formData.age),
          gender: formData.gender,
          height: parseInt(formData.height),
          weight: parseFloat(formData.weight)
        }])

      if (userError) {
        setMessage(`Database Error: ${userError.message}`)
        setLoading(false)
        return
      }

      const currentTimestamp = new Date().toISOString()
      const { error: settingsError } = await supabase
        .from('UserSettings')
        .insert([{
          user_id: authData.user.id,
          activity_level: formData.activityLevel,
          created_at: currentTimestamp,
          updated_at: currentTimestamp
        }])

      if (settingsError) {
        setMessage(`UserSettings Error: ${settingsError.message}`)
        setLoading(false)
        return
      }

      try {
        await fetch('https://n8n-4mn8.onrender.com/webhook/calculate_bmr_tdee', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: authData.user.id })
        })
      } catch (error) {
        console.log('Webhook request failed:', error)
      }

      setMessage('Account created successfully! Please check your email for verification.')
      setTimeout(() => { onBack() }, 2000)

    } catch (error) {
      setMessage(`Error: ${error.message}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-start justify-center p-8 pt-12">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 mr-4 mt-1">
              <div className="grid grid-cols-3 grid-rows-3 gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-3.5 h-3.5 bg-green-500 rounded-sm"></div>
                ))}
              </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-semibold">My Nutrition GPT</h1>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">Welcome!</h2>
          <p className="text-lg md:text-xl mb-10">To create an account please fill in the following details</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-10 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-10">
            {[
              [['firstName', 'First Name', 'text'], ['lastName', 'Last Name', 'text']],
              [['email', 'Email', 'email'], ['password', 'Password', 'password']],
              [['age', 'Age', 'number'], ['gender', 'Gender', 'select']],
              [['height', 'Height (cm)', 'number'], ['weight', 'Weight (kg)', 'number']],
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {row.map(([id, label, type]) => (
                  <div key={id}>
                    <label htmlFor={id} className="block text-lg font-bold mb-2">
                      {label}
                    </label>
                    {type === 'select' ? (
                      <select
                        id={id}
                        name={id}
                        value={formData[id]}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    ) : (
                      <input
                        type={type}
                        id={id}
                        name={id}
                        value={formData[id]}
                        onChange={handleInputChange}
                        placeholder={label}
                        required
                        min={id === 'age' ? 1 : undefined}
                        max={id === 'age' ? 120 : id === 'height' ? 250 : id === 'weight' ? 300 : undefined}
                        step={id === 'weight' ? 0.1 : undefined}
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}

            <div className="flex flex-col items-center md:flex-row md:justify-between gap-8">
              <div className="w-full md:w-[48%]">
                <label htmlFor="activityLevel" className="block text-lg font-bold mb-2">
                  Activity Level
                </label>
                <select
                  id="activityLevel"
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                  required
                >
                  <option value="">Select Activity Level</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                  <option value="very_active">Very Active</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 pt-6">
              <button
                type="button"
                onClick={onBack}
                disabled={loading}
                className="w-full md:w-1/2 bg-gray-500 text-white py-4 px-6 rounded-md hover:bg-gray-600 disabled:opacity-50 font-medium text-lg"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-1/2 bg-green-500 text-white py-4 px-6 rounded-md hover:bg-green-600 disabled:opacity-50 font-medium text-lg shadow-md flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin mr-2 h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0..." />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {message && (
            <div className={`mt-8 p-4 rounded-lg text-sm ${
              message.includes('Error')
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

export default CompleteSignupForm
