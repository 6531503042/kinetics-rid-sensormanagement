"use client"

import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"
import { memo, useId } from "react"

interface TrendChartProps {
  title?: string
  data: Array<{ date: string; value: number | null | undefined }>
  dataKey?: string
  yAxisLabel?: string
  color?: string
  height?: number
  unit?: string
  showHeader?: boolean
  icon?: React.ReactNode
  className?: string
}

const CustomTooltip = memo(({ active, payload, label, color, backgroundColor, textColor, unit }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0]?.value;
    
    // Safe guard against null or undefined values
    if (value === undefined || value === null) {
      return null;
    }
    
    return (
      <div 
        className="rounded-lg border border-border/60 p-2.5 bg-card/95 backdrop-blur-sm shadow-lg text-sm"
        style={{ 
          backgroundColor: backgroundColor || 'var(--background)', 
          color: textColor || 'var(--foreground)',
        }}
      >
        <div className="flex justify-between gap-4 items-center">
          <span className="text-xs opacity-75">{label}</span>
          <span className="font-medium">
            {typeof value === 'number' ? value.toFixed(2) : value}
            {unit && <span className="ml-1 text-xs opacity-75">{unit}</span>}
          </span>
        </div>
      </div>
    );
  }

  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

const TrendChart = memo(({
  title = "",
  data,
  dataKey = "value",
  yAxisLabel,
  color = "#3b82f6",
  height = 200,
  unit,
  showHeader = true,
  icon,
  className
}: TrendChartProps) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const { language } = useLanguage()
  
  // Generate a unique ID using React's useId hook
  const uniqueId = useId()
  const gradientId = `chart-gradient-${uniqueId.replace(/:/g, '')}`
  
  // Format date to be more readable
  const formattedData = data.map(item => {
    const date = new Date(item.date);
    const formattedDate = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'th-TH', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
    }).format(date);
    
    return {
      ...item,
      date: formattedDate
    }
  });
  
  // Calculate statistics
  const values = data.map(item => item.value).filter(val => val !== null && val !== undefined) as number[];
  const latest = values.length > 0 ? values[values.length - 1] : 0;
  const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  
  const cardClasses = cn(
    "overflow-hidden border rounded-lg shadow-sm transition-shadow hover:shadow-md", 
    className
  );

  return (
    <Card className={cardClasses}>
      {showHeader && title && (
        <CardHeader className="pb-0 pt-4 px-4 flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10">
                <div className="text-primary">{icon}</div>
              </div>
            )}
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }}></span>
              <span className="text-muted-foreground ml-1.5 mr-1">
                {language === 'en' ? 'Latest:' : 'ล่าสุด:'}
              </span>
              <span className="font-medium">{latest.toFixed(2)} {unit}</span>
            </div>
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-primary/40 mr-1.5"></span>
              <span className="text-muted-foreground mr-1">
                {language === 'en' ? 'Avg:' : 'เฉลี่ย:'}
              </span>
              <span className="font-medium">{average.toFixed(2)} {unit}</span>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={cn(showHeader && title ? "pt-4" : "pt-0 px-0")}>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.7} />
                  <stop offset="60%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
                stroke={isDark ? "rgba(255,255,255,0.075)" : "rgba(0,0,0,0.075)"} 
              />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={{ stroke: isDark ? "rgba(255,255,255,0.075)" : "rgba(0,0,0,0.075)" }}
                dy={10}
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                tickLine={false} 
                axisLine={{ stroke: isDark ? "rgba(255,255,255,0.075)" : "rgba(0,0,0,0.075)" }}
                label={
                  yAxisLabel 
                    ? { 
                        value: yAxisLabel, 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { 
                          textAnchor: 'middle',
                          fontSize: 9,
                          fill: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"
                        },
                        dx: -10
                      } 
                    : undefined
                }
                width={40}
              />
              <Tooltip 
                cursor={{ stroke: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", strokeWidth: 1 }}
                content={
                  <CustomTooltip 
                    backgroundColor={isDark ? "hsl(222.2, 84%, 4.9%, 0.95)" : "hsl(0, 0%, 100%, 0.95)"}
                    textColor={isDark ? "hsl(210, 40%, 98%)" : "hsl(222.2, 84%, 4.9%)"}
                    color={color}
                    unit={unit}
                  />
                } 
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                activeDot={{ r: 4, strokeWidth: 1, stroke: "#fff" }}
                isAnimationActive={true}
                animationDuration={1000}
                connectNulls={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
});

TrendChart.displayName = 'TrendChart';

export { TrendChart }
export default TrendChart
