import React from 'react'
import { cn } from "@/lib/utils"

export type StatCardProps = {
  title: string
  value: string | number
  icon?: React.ElementType
  iconColor?: 'primary' | 'warning' | 'success' | 'info' | 'destructive'
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
  children?: React.ReactNode
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = 'primary',
  description,
  trend = 'neutral',
  className,
  children
}: StatCardProps) {
  // Map color variants to Tailwind classes
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    warning: 'bg-warning/10 text-warning-foreground',
    success: 'bg-success/10 text-success-foreground',
    info: 'bg-info/10 text-info-foreground',
    destructive: 'bg-destructive/10 text-destructive-foreground'
  }

  const trendColorMap = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground'
  }

  return (
    <div className={cn("card-dashboard group p-4", className)}>
      <div className="flex items-center justify-between">
        {Icon && (
          <div className={cn("rounded-md p-2", colorMap[iconColor])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
        {trend !== 'neutral' && (
          <div className={cn("text-sm font-medium", trendColorMap[trend])}>
            {trend === 'up' ? '↑' : '↓'}
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-semibold text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </h3>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {value}
        </p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
} 