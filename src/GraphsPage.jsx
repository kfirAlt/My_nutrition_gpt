import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'

function GraphsPage({ user, onBack }) {
  const [selectedValue, setSelectedValue] = useState('kcal')
  const [selectedPeriod, setSelectedPeriod] = useState('day')
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)

  const valueOptions = [
    { value: 'kcal', label: 'Kcal' },
    { value: 'protein', label: 'Protein' },
    { value: 'carbs', label: 'Carbs' },
    { value: 'fat', label: 'Fat' }
  ]

  const periodOptions = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' }
  ]

  const fetchChartData = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const endDate = new Date()
      let startDate = new Date()
      let intervals = []

      // Calculate date ranges based on selected period
      if (selectedPeriod === 'day') {
        startDate.setDate(endDate.getDate() - 6) // Last 7 days
        intervals = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(startDate)
          date.setDate(startDate.getDate() + i)
          return date.toISOString().split('T')[0]
        })
      } else if (selectedPeriod === 'week') {
        startDate.setDate(endDate.getDate() - 27) // Last 4 weeks
        intervals = Array.from({ length: 4 }, (_, i) => {
          const weekStart = new Date(startDate)
          weekStart.setDate(startDate.getDate() + (i * 7))
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          return {
            start: weekStart.toISOString().split('T')[0],
            end: weekEnd.toISOString().split('T')[0],
            label: `Week ${i + 1}`
          }
        })
      } else if (selectedPeriod === 'month') {
        startDate.setMonth(endDate.getMonth() - 5) // Last 6 months
        intervals = Array.from({ length: 6 }, (_, i) => {
          const monthStart = new Date(startDate)
          monthStart.setMonth(startDate.getMonth() + i)
          const monthEnd = new Date(monthStart)
          monthEnd.setMonth(monthStart.getMonth() + 1)
          monthEnd.setDate(0) // Last day of the month
          return {
            start: monthStart.toISOString().split('T')[0],
            end: monthEnd.toISOString().split('T')[0],
            label: monthStart.toLocaleDateString('en-US', { month: 'short' })
          }
        })
      }

      // Fetch data for each interval
      const dataPromises = intervals.map(async (interval) => {
        let start, end, label

        if (selectedPeriod === 'day') {
          start = interval
          end = interval
          label = new Date(interval).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        } else {
          start = interval.start
          end = interval.end
          label = interval.label
        }

        const { data, error } = await supabase
          .from('Meal')
          .select(`
            date,
            FoodItem (
              ${selectedValue}
            )
          `)
          .eq('user_id', user.id)
          .gte('date', start)
          .lte('date', end)

        if (error) {
          console.error('Error fetching data:', error)
          return { label, value: 0 }
        }

        // Sum the selected value for this interval
        const total = data.reduce((sum, meal) => {
          return sum + meal.FoodItem.reduce((mealSum, item) => {
            return mealSum + (item[selectedValue] || 0)
          }, 0)
        }, 0)

        return { label, value: Math.round(total) }
      })

      const results = await Promise.all(dataPromises)
      setChartData(results)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChartData()
  }, [selectedValue, selectedPeriod, user])

  const maxValue = Math.max(...chartData.map(d => d.value), 1)

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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Nutrition Graphs</h2>
          <p className="text-xl text-gray-600">Visualize your nutrition progress</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Select Value
              </label>
              <select
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
              >
                {valueOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Select Time Period
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            {valueOptions.find(v => v.value === selectedValue)?.label} Over Time
          </h3>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading chart data...</p>
            </div>
          ) : chartData.length > 0 ? (
            <div className="space-y-6">
              {/* Chart Bars */}
              <div className="flex items-end justify-between h-64 px-4">
                {chartData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center flex-1 mx-1">
                    <div className="relative w-full">
                      <div
                        className="bg-green-500 rounded-t-lg transition-all duration-300 hover:bg-green-600"
                        style={{
                          height: `${(data.value / maxValue) * 200}px`,
                          minHeight: data.value > 0 ? '4px' : '0px'
                        }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {data.value}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-2 text-center">
                      {data.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Legend */}
              <div className="text-center text-gray-600">
                <p className="text-sm">
                  Showing {selectedPeriod === 'day' ? 'last 7 days' : 
                          selectedPeriod === 'week' ? 'last 4 weeks' : 'last 6 months'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-lg">No data available for the selected period</p>
              <p className="text-sm mt-2">Try logging some meals to see your progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GraphsPage 