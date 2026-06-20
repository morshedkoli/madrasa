import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: { value: number; positive: boolean }
  className?: string
}

export function StatCard({ title, value, icon: Icon, description, trend, className }: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {description && <p className="text-xs text-gray-400">{description}</p>}
            {trend && (
              <p className={cn('text-xs font-medium', trend.positive ? 'text-green-600' : 'text-red-500')}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          <div className="p-3 bg-[#1B6B3A]/10 rounded-lg">
            <Icon className="w-6 h-6 text-[#1B6B3A]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
