import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'

function SettingsPage({ user, onBack }) {
  const [userData, setUserData] = useState(null)
  const [userSettings, setUserSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Fetch user data and settings
  const fetchUserData = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      // Fetch user data
      const { data: userInfo, error: userError } = await supabase
        .from('User')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('Error fetching user data:', userError)
        return
      }

      // Fetch user settings
      const { data: settings, error: settingsError } = await supabase
        .from('UserSettings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (settingsError) {
        console.error('Error fetching user settings:', settingsError)
        return
      }

      setUserData(userInfo)
      setUserSettings(settings)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [user])

  const handleEdit = (field, value) => {
    setEditingField(field)
    setEditValue(value)
  }

  const handleCancel = () => {
    setEditingField(null)
    setEditValue('')
  }

  const handleSave = async (field) => {
    if (!confirm('Are you sure you want to update this field?')) {
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const currentTimestamp = new Date().toISOString()

      // Determine which table to update based on the field
      const isUserField = ['first_name', 'last_name', 'email', 'password', 'age', 'gender', 'height', 'weight'].includes(field)
      
      if (isUserField) {
        const { error } = await supabase
          .from('User')
          .update({
            [field]: editValue,
            updated_at: currentTimestamp
          })
          .eq('id', user.id)

        if (error) {
          setMessage(`Error updating ${field}: ${error.message}`)
          setSaving(false)
          return
        }
      } else {
        // Update UserSettings table
        const { error } = await supabase
          .from('UserSettings')
          .update({
            [field]: editValue,
            updated_at: currentTimestamp
          })
          .eq('user_id', user.id)

        if (error) {
          setMessage(`Error updating ${field}: ${error.message}`)
          setSaving(false)
          return
        }
      }

      // Refresh data
      await fetchUserData()
      setEditingField(null)
      setEditValue('')
      setMessage('Field updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const renderField = (label, value, field, type = 'text') => {
    const isEditing = editingField === field
    const isReadOnly = field === 'bmr' || field === 'tdee'

    return (
      <div key={field} className="mb-6">
        <label className="block text-lg font-bold mb-2 text-gray-700">
          {label}
        </label>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <input
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                placeholder={label}
              />
              <button
                onClick={() => handleSave(field)}
                disabled={saving}
                className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors duration-200"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-lg">
                {value || 'Not set'}
              </div>
              {!isReadOnly && (
                <button
                  onClick={() => handleEdit(field, value || '')}
                  className="text-green-600 hover:text-green-700 p-2 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50">
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

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Account Settings</h2>
          <p className="text-xl text-gray-600">Manage your personal information and preferences</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-10 md:p-12">
          {message && (
            <div className={`mb-8 p-4 rounded-lg ${
              message.includes('Error')
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Personal Information</h3>
              {renderField('First Name', userData?.first_name, 'first_name')}
              {renderField('Last Name', userData?.last_name, 'last_name')}
              {renderField('Email', userData?.email, 'email', 'email')}
              {renderField('Password', userData?.password ? '••••••••' : '', 'password', 'password')}
              {renderField('Age', userData?.age, 'age', 'number')}
              {renderField('Gender', userData?.gender, 'gender')}
              {renderField('Height (cm)', userData?.height, 'height', 'number')}
              {renderField('Weight (kg)', userData?.weight, 'weight', 'number')}
            </div>

            {/* Settings and Calculations */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Settings & Calculations</h3>
              {renderField('Activity Level', userSettings?.activity_level, 'activity_level')}
              {renderField('BMR (Basal Metabolic Rate)', userSettings?.bmr, 'bmr')}
              {renderField('TDEE (Total Daily Energy Expenditure)', userSettings?.tdee, 'tdee')}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center text-gray-600">
              <p className="text-sm">
                Last updated: {userData?.updated_at ? new Date(userData.updated_at).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage 