'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'

function formatTooltip(seconds) {
  const hours = (seconds / 3600).toFixed(1)
  const minutes = Math.round(seconds / 60)

  if (seconds === 0) return '0min'
  if (seconds < 3600) return `${minutes}min`
  return `${hours}h (${minutes}min)`
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null

  const seconds = payload[0].payload.seconds

  return (
    <div style={{
      background: '#1e1e2e',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '10px 14px',
    }}>
      <p style={{ color: '#aaa', margin: 0 }}>{payload[0].payload.date}</p>
      <p style={{ color: '#6366f1', margin: 0, fontWeight: 'bold' }}>
        {formatTooltip(seconds)}
      </p>
    </div>
  )
}

export default function ProjectHoursChart({ initialData = [] }) {
  const chartData = initialData.map(day => ({
    date: day.date,
    hours: Math.round((day.seconds / 3600) * 10) / 10,
    seconds: day.seconds
  }))

  //if (chartData.length === 0) return <div>No time tracked yet, </div>

  return (
    <div>
      <h3>Time Spent Per Day {chartData.length === 0 && "(no time tracked yet)"}</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#333"
          />

          <XAxis
            dataKey="date"
            tick={{ fill: '#aaa', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            unit="h"
            tick={{ fill: '#aaa', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={35}
          />

          <Tooltip content={<CustomTooltip />} />

          <Bar
            dataKey="hours"
            fill="#0085fa"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
