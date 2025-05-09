"use client"

import { useEffect, useState, useRef } from "react"
import { Activity, Cloud, Droplet, Thermometer, Wind, Sun, Gauge, Download, BarChart3, Compass } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { useSensorData } from "@/hooks/useSensorData"
import { useAlerts } from "@/hooks/useAlerts"
import { StatCard } from "@/components/stat-card"
import { TrendChart } from "@/components/trend-chart"
import { generateHistoricalData } from "@/mock/historical-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { exportStationsToCSV } from "@/lib/csv-export"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { alerts as mockAlerts } from "@/mock/alerts"
import type { Alert } from "@/types"

export default function DashboardPage() {
  const { t, language } = useLanguage()
  const { stations, onlineCount, getAverageEt0, getAverageRainfall, getAverageWaterLevel } = useSensorData()
  const { pendingCount, allAlerts } = useAlerts()
  const [et0Data, setEt0Data] = useState<any[]>([])
  const [rainfallData, setRainfallData] = useState<any[]>([])
  const [waterLevelData, setWaterLevelData] = useState<any[]>([])
  const [temperatureData, setTemperatureData] = useState<any[]>([])
  const [humidityData, setHumidityData] = useState<any[]>([])
  const [windData, setWindData] = useState<any[]>([])
  const [windDirectionData, setWindDirectionData] = useState<any[]>([])
  const [solarData, setSolarData] = useState<any[]>([])
  const [pressureData, setPressureData] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [animateValue, setAnimateValue] = useState(false)

  // Calculated values
  const totalEt0 = getAverageEt0()
  const totalRainfall = getAverageRainfall()
  const avgWaterLevel = getAverageWaterLevel()
  
  // Additional calculated values
  const avgWindSpeed = 3.2 + (Math.random() * 1.5)  // Mock value
  const avgWindDirection = 172 + (Math.random() * 30) // Mock value 
  const avgPressure = 1013.25 + (Math.random() * 1.5) // Mock value
  
  // Use the most recent alerts
  const recentAlerts = allAlerts.slice(0, 4)

  useEffect(() => {
    // Generate sample data for charts
    const historicalData = generateHistoricalData("station-1", 7)

    setEt0Data(
      historicalData.map((item) => ({
        date: item.date,
        value: item.et0,
      })),
    )

    setRainfallData(
      historicalData.map((item) => ({
        date: item.date,
        value: item.rainfall,
      })),
    )

    setWaterLevelData(
      historicalData.map((item) => ({
        date: item.date,
        value: item.waterLevel,
      })),
    )

    setTemperatureData(
      historicalData.map((item) => ({
        date: item.date,
        value: item.temperature,
      })),
    )

    setHumidityData(
      historicalData.map((item) => ({
        date: item.date,
        value: item.humidity,
      })),
    )

    setWindData(
      historicalData.map((item) => ({
        date: item.date,
        value: item.windSpeed,
      })),
    )
    
    // Generate wind direction data (mock data)
    setWindDirectionData(
      historicalData.map((item) => ({
        date: item.date,
        value: 180 + (Math.random() * 90 - 45), // Generate data around south
      })),
    )

    setSolarData(
      historicalData.map((item) => ({
        date: item.date,
        value: item.solarRadiation,
      })),
    )

    // Generate pressure data (mock data as it's not in the HistoricalData type)
    setPressureData(
      historicalData.map((item) => ({
        date: item.date,
        value: 1013.25 + (Math.random() * 10 - 5), // Generate random pressure data
      })),
    )

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Animate values every 5 seconds
    const animateInterval = setInterval(() => {
      setAnimateValue(true)
      setTimeout(() => setAnimateValue(false), 1000)
    }, 5000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(animateInterval)
    }
  }, [])

  const handleExport = () => {
    exportStationsToCSV(stations)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <Button onClick={handleExport} className="gap-2 !border-2 !border-primary !bg-primary !text-white !shadow-lg hover:!bg-white hover:!text-primary transition-all duration-200 font-semibold px-6 py-2 rounded-lg">
          <Download className="h-4 w-4" />
          {t("app.export")}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="overview" className="text-sm">
            {t("dashboard.overview")}
          </TabsTrigger>
          <TabsTrigger value="trends" className="text-sm">
            {t("dashboard.trends")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t("dashboard.sensors.online")}
              value={onlineCount}
              icon={Activity}
              description="ISMMA2300"
              className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
            />
            <StatCard
              title={t("dashboard.et0.today")}
              value={totalEt0.toFixed(2)}
              icon={Thermometer}
              unit={t("units.et0")}
              className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20"
            />
            <StatCard
              title={t("sensors.rainfall")}
              value={totalRainfall.toFixed(2)}
              icon={Cloud} 
              unit={t("units.rainfall")}
              className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20"
            />
            <StatCard
              title={t("dashboard.water.level")}
              value={avgWaterLevel.toFixed(2)}
              icon={Droplet}
              unit={t("units.water.level")}
              className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20"
            />
          </div>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t("sensors.wind")}
              value={avgWindSpeed.toFixed(1)}
              icon={Wind}
              unit={t("units.wind")}
              secondaryValue={{
                label: t("sensors.wind.direction"),
                value: avgWindDirection.toFixed(0),
                unit: t("units.wind.direction")
              }}
              className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20"
            />
            <StatCard
              title={t("sensors.pressure")}
              value={avgPressure.toFixed(1)}
              icon={Gauge}
              unit={t("units.pressure")}
              className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20"
            />
            <StatCard
              title={t("sensors.temperature")}
              value={(22 + Math.random() * 5).toFixed(1)}
              icon={Thermometer}
              unit="°C"
              className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20"
            />
            <StatCard
              title={t("sensors.humidity")}
              value={(65 + Math.random() * 15).toFixed(1)}
              icon={Droplet}
              unit="%"
              className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/20"
            />
          </div>

          <Card className="overflow-hidden border rounded-xl shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-2 pt-4">
              <CardTitle className="text-base font-semibold">{t("dashboard.overview")}</CardTitle>
              <CardDescription className="text-xs">
                {language === "en" ? "Current station data and recent alerts" : "ข้อมูลสถานีปัจจุบันและการแจ้งเตือนล่าสุด"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                <div className="col-span-1 lg:col-span-2 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-xl p-4 border border-orange-500/20">
                  <h3 className="text-sm font-semibold mb-3 text-orange-700">{t("dashboard.et0.trend")}</h3>
                  <TrendChart
                    title=""
                    data={et0Data}
                    yAxisLabel={t("units.et0")}
                    color="#f97316"
                    height={280}
                    unit={t("units.et0")}
                    showHeader={false}
                  />
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl border border-amber-500/20 overflow-hidden">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold mb-1 text-amber-700">{t("dashboard.alerts")}</h3>
                  </div>
                  <div className="px-4 py-2 flex items-center justify-between border-t border-amber-200/30">
                    <span className="text-sm font-medium">{t("alerts.pending")}</span>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                      {pendingCount}
                    </Badge>
                  </div>
                  {recentAlerts.map((alert: Alert, index: number) => (
                    <div
                      key={alert.id}
                      className={`px-4 py-2 flex flex-col gap-1 ${
                        index < recentAlerts.length - 1 ? "border-t border-amber-200/30" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate max-w-[180px]">
                          {alert.stationName}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            alert.type === "offline"
                              ? "bg-red-500/10 text-red-600 border-red-200"
                              : alert.type === "weather"
                              ? "bg-amber-500/10 text-amber-600 border-amber-200"
                              : "bg-blue-500/10 text-blue-600 border-blue-200"
                          }
                        >
                          {alert.type}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{alert.message}</span>
                    </div>
                  ))}
                  <div className="p-3 bg-amber-50/30 border-t border-amber-200/30">
                    <Link href="/alerts">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-amber-400 bg-white text-amber-700 hover:bg-amber-50"
                      >
                        {t("alerts.title")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="overflow-hidden border rounded-xl shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-2 pt-4">
              <CardTitle className="text-base font-semibold">{t("stations.history")}</CardTitle>
              <CardDescription className="text-xs">
                {language === "en" ? "Sensor data visualization and trends" : "การแสดงผลข้อมูลและแนวโน้มของเซ็นเซอร์"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-xl p-4 border border-orange-500/20">
                  <h3 className="text-sm font-semibold mb-3 text-orange-700">{t("sensors.temperature")}</h3>
                  <TrendChart
                    title=""
                    data={temperatureData}
                    yAxisLabel={t("units.temperature")}
                    color="#ef4444"
                    height={250}
                    unit="°C"
                    showHeader={false}
                  />
                </div>

                <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-xl p-4 border border-indigo-500/20">
                  <h3 className="text-sm font-semibold mb-3 text-indigo-700">{t("sensors.humidity")}</h3>
                  <TrendChart
                    title=""
                    data={humidityData}
                    yAxisLabel={t("units.humidity")}
                    color="#6366f1"
                    height={250}
                    unit="%"
                    showHeader={false}
                  />
                </div>

                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-xl p-4 border border-cyan-500/20">
                  <h3 className="text-sm font-semibold mb-3 text-cyan-700">{t("sensors.wind")}</h3>
                  <TrendChart
                    title=""
                    data={windData}
                    yAxisLabel={t("units.wind")}
                    color="#64748b"
                    height={250}
                    unit={t("units.wind")}
                    showHeader={false}
                  />
                </div>
                
                <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/5 rounded-xl p-4 border border-slate-500/20">
                  <h3 className="text-sm font-semibold mb-3 text-slate-700">{t("sensors.wind.direction")}</h3>
                  <TrendChart
                    title=""
                    data={windDirectionData}
                    yAxisLabel={t("units.wind.direction")}
                    color="#475569"
                    height={250}
                    unit={t("units.wind.direction")}
                    showHeader={false}
                  />
                </div>

                <div className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 rounded-xl p-4 border border-violet-500/20">
                  <h3 className="text-sm font-semibold mb-3 text-violet-700">{t("sensors.pressure")}</h3>
                  <TrendChart
                    title=""
                    data={pressureData}
                    yAxisLabel={t("units.pressure")}
                    color="#7c3aed"
                    height={250}
                    unit={t("units.pressure")}
                    showHeader={false}
                  />
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-4 border border-green-500/20">
                  <h3 className="text-sm font-semibold mb-3 text-green-700">{t("sensors.rainfall")}</h3>
                  <TrendChart
                    title=""
                    data={rainfallData}
                    yAxisLabel={t("units.rainfall")}
                    color="#0ea5e9"
                    height={250}
                    unit={t("units.rainfall")}
                    showHeader={false}
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-4 border border-blue-500/20 col-span-1 md:col-span-2">
                  <h3 className="text-sm font-semibold mb-3 text-blue-700">{t("stations.water.level")}</h3>
                  <TrendChart
                    title=""
                    data={waterLevelData}
                    yAxisLabel={t("units.water.level")}
                    color="#3b82f6"
                    height={250}
                    unit={t("units.water.level")}
                    showHeader={false}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
