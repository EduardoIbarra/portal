'use client'

import React, { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface Factura {
  id: string
  total: number
  estado: string
}

export function InvoiceStatusChart({ facturas }: { facturas: Factura[] }) {
  const data = useMemo(() => {
    let pagada = 0
    let pendiente = 0
    let cancelada = 0

    facturas.forEach(f => {
      const amount = Number(f.total || 0)
      if (f.estado === 'pagada') pagada += amount
      else if (f.estado === 'cancelada') cancelada += amount
      else pendiente += amount
    })

    return [
      { name: 'Pagada', value: pagada, color: '#10B981' }, // success
      { name: 'Pendiente', value: pendiente, color: '#F59E0B' }, // warning
      { name: 'Cancelada', value: cancelada, color: '#EF4444' }, // danger
    ].filter(d => d.value > 0)
  }, [facturas])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border border-border p-3 rounded-xl shadow-lg">
          <p className="text-dark-500 font-bold text-xs uppercase tracking-widest mb-1">{data.name}</p>
          <p className="font-black text-lg" style={{ color: data.color }}>
            ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      )
    }
    return null
  }

  if (!facturas || facturas.length === 0 || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[300px]">
        <p className="text-dark-300 italic text-sm">No hay datos suficientes para graficar.</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full flex flex-col items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-dark-500 font-bold text-xs">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
