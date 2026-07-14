'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'

export function TopProductsChart({ data }: { data: { name: string, value: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-dark-300 italic text-sm">
        No hay datos de productos suficientes.
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8f1f9" horizontal={false} />
          <XAxis 
            type="number" 
            tickFormatter={(val) => formatCurrency(val, true)} 
            tick={{ fill: '#8a8b8d', fontSize: 10 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fill: '#5a5b5d', fontSize: 11 }} 
            width={120} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            formatter={(value: any) => formatCurrency(value)} 
          />
          <Bar dataKey="value" fill="#0763a9" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
