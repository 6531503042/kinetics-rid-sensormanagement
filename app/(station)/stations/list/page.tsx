"use client"
import { useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { useSensorData } from "@/hooks/useSensorData"
import { exportStationsToCSV } from "@/lib/csv-export"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Eye, Calendar, BarChart3, LineChart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendChart } from "@/components/trend-chart"
import { generateHistoricalData } from "@/mock/historical-data"

export default function StationsListPage() {
  const { t, language } = useLanguage()
  const { stations } = useSensorData()
  const [selectedStation, setSelectedStation] = useState<string | null>(null)
  const [dataView, setDataView] = useState<"daily" | "weekly" | "monthly">("daily")
  const [selectedSensor, setSelectedSensor] = useState<
    "et0" | "rainfall" | "waterLevel" | "temperature" | "humidity" | "windSpeed" | "solarRadiation"
  >("et0")

  const handleExport = () => {
    exportStationsToCSV(stations)
  }

  // Generate historical data for selected station
  const historicalData = selectedStation
    ? generateHistoricalData(selectedStation, dataView === "daily" ? 7 : dataView === "weekly" ? 30 : 90)
    : []

  const sensorOptions = [
    { value: "et0", label: t("stations.et0"), color: "#f97316", unit: t("units.et0"), model: "ISMMA2300" },
    {
      value: "rainfall",
      label: t("stations.rainfall"),
      color: "#10b981",
      unit: t("units.rainfall"),
      model: "DQA230.1",
    },
    {
      value: "waterLevel",
      label: t("stations.water.level"),
      color: "#3b82f6",
      unit: t("units.water.level"),
      model: "DQA230.1",
    },
    {
      value: "temperature",
      label: t("sensors.temperature"),
      color: "#ef4444",
      unit: t("units.temperature"),
      model: "ISMMA2300",
    },
    {
      value: "humidity",
      label: t("sensors.humidity"),
      color: "#6366f1",
      unit: t("units.humidity"),
      model: "ISMMA2300",
    },
    { value: "windSpeed", label: t("sensors.wind"), color: "#64748b", unit: t("units.wind"), model: "ISMMA2300" },
    {
      value: "solarRadiation",
      label: t("sensors.solar"),
      color: "#eab308",
      unit: t("units.solar"),
      model: "ISMMA2300",
    },
  ]

  const selectedSensorOption = sensorOptions.find((option) => option.value === selectedSensor)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t("stations.list")}</h1>
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          {t("app.export")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("stations.title")}</CardTitle>
          <CardDescription>
            {language === "en"
              ? "LSI LASTEM sensors deployed across Mukdahan province"
              : "เซ็นเซอร์ LSI LASTEM ที่ติดตั้งทั่วจังหวัดมุกดาหาร"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("stations.name")}</TableHead>
                <TableHead>{t("stations.status")}</TableHead>
                <TableHead>{t("stations.model")}</TableHead>
                <TableHead>{t("stations.et0")}</TableHead>
                <TableHead>{t("stations.rainfall")}</TableHead>
                <TableHead>{t("stations.water.level")}</TableHead>
                <TableHead className="text-right">{t("app.details")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stations.map((station) => (
                <TableRow
                  key={station.id}
                  className={selectedStation === station.id ? "bg-primary/5" : ""}
                  onClick={() => setSelectedStation(station.id)}
                >
                  <TableCell className="font-medium">{station.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={station.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant="outline"
                        className="w-fit text-xs bg-orange-500/10 text-orange-700 dark:text-orange-400"
                      >
                        ISMMA2300
                      </Badge>
                      <Badge
                        variant="outline"
                        className="w-fit text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400"
                      >
                        DQA230.1
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{station.sensors.et0.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">{t("units.et0")}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{station.sensors.rainfall.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">{t("units.rainfall")}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{station.sensors.waterLevel.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">{t("units.water.level")}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/stations/details/${station.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t("app.view")}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedStation && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                {stations.find((s) => s.id === selectedStation)?.name} - {t("stations.history")}
              </CardTitle>
              <CardDescription>
                {language === "en" ? "Sensor data visualization" : "การแสดงผลข้อมูลเซ็นเซอร์"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tabs
                defaultValue="daily"
                onValueChange={(value) => setDataView(value as "daily" | "weekly" | "monthly")}
              >
                <TabsList>
                  <TabsTrigger value="daily">
                    <Calendar className="h-4 w-4 mr-1" />
                    {language === "en" ? "Daily" : "รายวัน"}
                  </TabsTrigger>
                  <TabsTrigger value="weekly">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    {language === "en" ? "Weekly" : "รายสัปดาห์"}
                  </TabsTrigger>
                  <TabsTrigger value="monthly">
                    <LineChart className="h-4 w-4 mr-1" />
                    {language === "en" ? "Monthly" : "รายเดือน"}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {sensorOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedSensor === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSensor(option.value as any)}
                  className={selectedSensor === option.value ? "" : "border-" + option.color.replace("#", "") + "/20"}
                >
                  <div className="flex flex-col items-center text-xs">
                    <span>{option.label}</span>
                    <span className="text-[10px] opacity-80">{option.model}</span>
                  </div>
                </Button>
              ))}
            </div>

            {selectedSensorOption && (
              <TrendChart
                title={`${selectedSensorOption.label} (${selectedSensorOption.model})`}
                data={historicalData.map((item) => ({
                  date: item.date,
                  value: item[selectedSensor],
                }))}
                yAxisLabel={selectedSensorOption.unit}
                color={selectedSensorOption.color}
                height={350}
                unit={selectedSensorOption.unit}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
