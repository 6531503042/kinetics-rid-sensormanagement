import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  className?: string
  valueRef?: React.RefObject<HTMLDivElement>
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  unit?: string
  secondaryValue?: {
    value: string | number
    unit?: string
    label?: string
  }
  color?: string
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    className, 
    valueRef, 
    trend, 
    unit, 
    secondaryValue,
    color 
  }, ref) => {
    // Default color if not provided
    const cardColor = color || "#3b82f6";
    
    return (
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-200 border rounded-xl",
          "shadow-sm hover:shadow-lg relative",
          className
        )} 
        ref={ref}
      >
        <CardHeader className="pb-1 relative flex items-start">
          <div className="w-full flex justify-between items-start">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div 
              className="flex items-center justify-center rounded-full h-9 w-9 -mt-1 -mr-1"
              style={{ backgroundColor: `${cardColor}15` }}
            >
              <Icon 
                className="h-5 w-5"
                style={{ color: cardColor }} 
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative">
          <div className="space-y-3">
            <div className="flex flex-col">
              <div className="flex items-baseline mb-1">
                <div 
                  ref={valueRef} 
                  className="text-2xl font-bold"
                  style={{ color: cardColor }}
                >
              {value}
            </div>
                {unit && (
                  <div className="ml-1 text-sm text-muted-foreground">
                    {unit}
                  </div>
                )}
              </div>
              
              {secondaryValue && (
                <div className="flex items-baseline text-sm">
                  <span className="font-medium">
                    {secondaryValue.label ? `${secondaryValue.label}: ` : ''}
                    {secondaryValue.value}
                  </span>
                  {secondaryValue.unit && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      {secondaryValue.unit}
                    </span>
                  )}
              </div>
            )}
            </div>

            {(description || trend) && (
              <div className="flex items-center pt-1 border-t border-border/30">
            {description && (
                  <p className="text-xs text-muted-foreground">
                {description}
              </p>
                )}
                
                {trend && (
                  <div 
                    className={cn(
                      "inline-flex items-center ml-auto text-xs font-medium",
                      trend.isPositive ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
                    )}
                  >
                    <span className="mr-1">
                      {trend.isPositive ? "↑" : "↓"}
                    </span>
                    {trend.value}
                    {trend.label}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
)

StatCard.displayName = "StatCard"
