import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'

function HistoryPage({ user, onBack }) {
  const [selectedDate, setSelectedDate] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [dailyMeals, setDailyMeals] = useState([])
  const [summaryData, setSummaryData] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch daily meals for selected date
  const fetchDailyMeals = async (date) => {
    if (!date || !user?.id) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('Meal')
        .select(`
          id,
          date,
          FoodItem (
            item_name,
            item_quantity,
            kcal,
            protein,
            carbs,
            fat
          )
        `)
        .eq('user_id', user.id)
        .eq('date', date)

      if (error) {
        console.error('Error fetching daily meals:', error)
        return
      }

      // Flatten the data structure
      const flattenedMeals = data.flatMap(meal => 
        meal.FoodItem.map(item => ({
          ...item,
          meal_id: meal.id,
          date: meal.date
        }))
      )

      setDailyMeals(flattenedMeals)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch summary data for date range
  const fetchSummaryData = async (startDate, endDate) => {
    if (!startDate || !endDate || !user?.id) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('Meal')
        .select(`
          date,
          FoodItem (
            kcal,
            protein,
            carbs,
            fat
          )
        `)
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching summary data:', error)
        return
      }

      // Aggregate data by date
      const aggregatedData = data.reduce((acc, meal) => {
        const date = meal.date
        if (!acc[date]) {
          acc[date] = {
            date,
            kcal: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          }
        }

        meal.FoodItem.forEach(item => {
          acc[date].kcal += item.kcal || 0
          acc[date].protein += item.protein || 0
          acc[date].carbs += item.carbs || 0
          acc[date].fat += item.fat || 0
        })

        return acc
      }, {})

      setSummaryData(Object.values(aggregatedData))
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedDate) {
      fetchDailyMeals(selectedDate)
    }
  }, [selectedDate, user])

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchSummaryData(dateRange.start, dateRange.end)
    }
  }, [dateRange, user])

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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Meal History</h2>
          <p className="text-xl text-gray-600">Track your nutrition journey</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Table Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Daily Meals</h3>
            
            <div className="mb-6">
              <label htmlFor="dailyDate" className="block text-lg font-medium text-gray-700 mb-2">
                Select a Date
              </label>
              <input
                type="date"
                id="dailyDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
              />
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading...</p>
              </div>
            ) : dailyMeals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Name</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Quantity</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Kcal</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Protein</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Carbs</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Fat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyMeals.map((meal, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 text-gray-900">{meal.item_name}</td>
                        <td className="py-3 px-2 text-gray-600">{meal.item_quantity}</td>
                        <td className="py-3 px-2 text-gray-600">{meal.kcal}</td>
                        <td className="py-3 px-2 text-gray-600">{meal.protein}g</td>
                        <td className="py-3 px-2 text-gray-600">{meal.carbs}g</td>
                        <td className="py-3 px-2 text-gray-600">{meal.fat}g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : selectedDate ? (
              <div className="text-center py-8 text-gray-500">
                No meals found for this date
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Please select a date to view meals
              </div>
            )}
          </div>

          {/* Summary Table Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Nutrition Summary</h3>
            
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Select Date Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading...</p>
              </div>
            ) : summaryData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Date</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Kcal</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Protein</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Carbs</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Fat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.map((day, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 text-gray-900">{new Date(day.date).toLocaleDateString()}</td>
                        <td className="py-3 px-2 text-gray-600">{Math.round(day.kcal)}</td>
                        <td className="py-3 px-2 text-gray-600">{Math.round(day.protein)}g</td>
                        <td className="py-3 px-2 text-gray-600">{Math.round(day.carbs)}g</td>
                        <td className="py-3 px-2 text-gray-600">{Math.round(day.fat)}g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : dateRange.start && dateRange.end ? (
              <div className="text-center py-8 text-gray-500">
                No data found for this date range
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Please select a date range to view summary
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HistoryPage 