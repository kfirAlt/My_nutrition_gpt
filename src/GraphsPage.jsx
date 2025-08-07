import { useState, useEffect, useMemo } from 'react'
import { supabase } from './supabaseClient.js'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts'

function GraphsPage({ user, onBack }) {
  const [selectedValue, setSelectedValue] = useState('kcal')
  const [selectedPeriod, setSelectedPeriod] = useState('day')
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)
  const [tdee, setTdee] = useState(user?.tdee || 2000)

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

      if (selectedPeriod === 'day') {
        startDate.setDate(endDate.getDate() - 6)
        intervals = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(startDate)
          date.setDate(startDate.getDate() + i)
          return date.toISOString().split('T')[0]
        })
      } else if (selectedPeriod === 'week') {
        startDate.setDate(endDate.getDate() - 27)
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
        startDate.setMonth(endDate.getMonth() - 5)
        intervals = Array.from({ length: 6 }, (_, i) => {
          const monthStart = new Date(startDate)
          monthStart.setMonth(startDate.getMonth() + i)
          const monthEnd = new Date(monthStart)
          monthEnd.setMonth(monthStart.getMonth() + 1)
          monthEnd.setDate(0)
          return {
            start: monthStart.toISOString().split('T')[0],
            end: monthEnd.toISOString().split('T')[0],
            label: monthStart.toLocaleDateString('en-US', { month: 'short' })
          }
        })
      }

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
          .select(`date, FoodItem ( ${selectedValue} )`)
          .eq('user_id', user.id)
          .gte('date', start)
          .lte('date', end)

        if (error) {
          console.error('Error fetching data:', error)
          return { label, value: 0 }
        }

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

  return (
    <div className="min-h-screen bg-green-50">
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 mr-3 grid grid-cols-3 grid-rows-3 gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
                ))}
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">My Nutrition GPT</h1>
            </div>
            <button
              onClick={onBack}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Nutrition Graphs</h2>
          <p className="text-xl text-gray-600">Visualize your nutrition progress</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Select Value</label>
              <select
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                {valueOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Select Time Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading chart data...</p>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <ReferenceLine y={selectedValue === 'kcal' ? tdee : null} stroke="red" label="TDEE" />
                <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg">No data available for the selected period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GraphsPage
