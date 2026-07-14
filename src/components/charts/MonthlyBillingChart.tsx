'use client'

import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface Factura {
  id: string
  total: number
  fecha_expedicion: string
}

export function MonthlyBillingChart({ facturas }: { facturas: Factura[] }) {
  const data = useMemo(() => {
    const grouped = facturas.reduce((acc, curr) => {
      if (!curr.fecha_expedicion) return acc
      const date = parseISO(curr.fecha_expedicion)
      const monthYear = format(date, 'MMM yy', { locale: es })
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          name: monthYear,
          total: 0,
          dateValue: date.getTime()
        }
      }
      acc[monthYear].total += Number(curr.total || 0)
      return acc
    }, {} as Record<string, { name: string, total: number, dateValue: number }>)

    // Convert to array and sort chronologically
    return Object.values(grouped)
      .sort((a, b) => a.dateValue - b.dateValue)
      .slice(-6) // Only show the last 6 months
  }, [facturas])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-border p-3 rounded-xl shadow-lg">
          <p className="text-dark-500 font-bold text-xs uppercase tracking-widest mb-1">{label}</p>
          <p className="text-brand-500 font-black text-lg">
            ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      )
    }
    return null
  }

  if (!facturas || facturas.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[300px]">
        <p className="text-dark-300 italic text-sm">No hay datos suficientes para graficar.</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fontWeight: 700, fill: '#6B7280' }}
            dy={10}
            className="capitalize"
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fontWeight: 700, fill: '#6B7280' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip cursor={{ fill: '#F3F4F6' }} content={<CustomTooltip />} />
          <Bar 
            dataKey="total" 
            fill="#3B82F6" 
            radius={[6, 6, 0, 0]} 
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
