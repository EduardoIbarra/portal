import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number | string, compact = false) => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount as any) || 0
  const absNum = Math.abs(num)
  if (compact && absNum >= 1000000) {
    return `${num < 0 ? '-' : ''}$${(absNum / 1000000).toFixed(2)}M`
  }
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(num)
}
