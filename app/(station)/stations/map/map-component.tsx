"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Station } from "@/types"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Thermometer, Droplet, Cloud, Wind, Sun, Info, Clock, Calendar, ArrowUpRight } from "lucide-react"
import Link from "next/link"

// Fix Leaflet icon issues
const getIcon = (status: string, sensorType: "water" | "weather") => {
  // Base color by status
  let statusColor = ""
  if (status === "online") {
    statusColor = "green"
  } else if (status === "warning") {
    statusColor = "orange"
  } else if (status === "offline") {
    statusColor = "red"
  } else {
    statusColor = "blue"
  }

  // Different icon shapes for different sensor types
  let iconUrl = ""
  if (sensorType === "water") {
    // Use blue markers for water sensors
    iconUrl = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png`
  } else {
    // Use regular markers for weather sensors
    iconUrl = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${statusColor}.png`
  }

  return new L.Icon({
    iconUrl,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

interface MapComponentProps {
  stations: Station[]
}

export default function MapComponent({ stations }: MapComponentProps) {
  const { t, language } = useLanguage()
  const [mapCenter, setMapCenter] = useState<[number, number]>([16.5434, 104.7235])
  const [weatherStations, setWeatherStations] = useState<Station[]>([])
  const [waterStations, setWaterStations] = useState<Station[]>([])

  useEffect(() => {
    // Separate stations into weather and water groups
    // For demo purposes, we'll just alternate them
    const weather: Station[] = []
    const water: Station[] = []

    stations.forEach((station, index) => {
      if (index % 2 === 0) {
        weather.push(station)
      } else {
        water.push(station)
      }
    })

    setWeatherStations(weather)
    setWaterStations(water)

    // Add custom CSS for the Leaflet popup
    const style = document.createElement('style')
    style.textContent = `
      .leaflet-popup-content-wrapper {
        border-radius: 8px;
        padding: 0;
        overflow: hidden;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      .leaflet-popup-content {
        margin: 0;
        width: auto !important;
        max-width: 350px;
      }
      .leaflet-popup-close-button {
        color: white !important;
        font-size: 18px !important;
        z-index: 10;
        top: 7px !important;
        right: 7px !important;
      }
      .leaflet-popup-tip {
        background: white;
      }
      .dark .leaflet-popup-tip {
        background: #1e293b;
      }
      @media (max-width: 500px) {
        .leaflet-popup-content {
          width: 280px !important;
        }
      }
      @media (max-width: 350px) {
        .leaflet-popup-content {
          width: 250px !important;
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [stations])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "#22c55e" // green-500
      case "warning":
        return "#f59e0b" // amber-500
      case "offline":
        return "#ef4444" // red-500
      default:
        return "#3b82f6" // blue-500
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      online: "bg-green-500 text-white",
      warning: "bg-amber-500 text-white",
      offline: "bg-red-500 text-white",
      critical: "bg-red-700 text-white",
    }

    return (
      <div className={`${colors[status as keyof typeof colors]} px-3 py-1 rounded-full text-center font-medium text-xs inline-flex items-center gap-1.5 shadow-sm`}>
        <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'animate-pulse' : ''} bg-white`}></span>
        <span>
          {status === "online"
            ? t("status.online")
            : status === "warning"
              ? t("status.warning")
              : status === "offline"
                ? t("status.offline")
                : t("status.critical")}
        </span>
      </div>
    )
  }

  // Generate relationship lines between stations
  const generateRelationshipLines = () => {
    const lines = []

    // Connect weather stations
    for (let i = 0; i < weatherStations.length - 1; i++) {
      lines.push({
        positions: [
          [weatherStations[i].location.lat, weatherStations[i].location.lng],
          [weatherStations[i + 1].location.lat, weatherStations[i + 1].location.lng],
        ],
        color: "#f97316", // Orange for weather stations
        dashArray: "5, 5",
      })
    }

    // Connect water stations
    for (let i = 0; i < waterStations.length - 1; i++) {
      lines.push({
        positions: [
          [waterStations[i].location.lat, waterStations[i].location.lng],
          [waterStations[i + 1].location.lat, waterStations[i + 1].location.lng],
        ],
        color: "#3b82f6", // Blue for water stations
        dashArray: "5, 5",
      })
    }

    return lines
  }

  const relationshipLines = generateRelationshipLines()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'th-TH', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <MapContainer center={mapCenter} zoom={8} style={{ height: "600px", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Relationship lines */}
      {relationshipLines.map((line, index) => (
        <Polyline
          key={`line-${index}`}
          positions={line.positions as [number, number][]}
          pathOptions={{
            color: line.color,
            weight: 2,
            opacity: 0.7,
            dashArray: line.dashArray,
          }}
        />
      ))}

      {/* Weather Stations Group */}
      <div className="weather-stations-group">
        {weatherStations.map((station) => (
          <div key={`weather-${station.id}`}>
            {/* Pulse effect for active stations */}
            {station.status === "online" && (
              <CircleMarker
                center={[station.location.lat, station.location.lng]}
                radius={20}
                pathOptions={{
                  color: "#f97316", // Orange for weather
                  fillColor: "#f97316",
                  fillOpacity: 0.2,
                }}
                className="animate-pulse"
              />
            )}

            <Marker position={[station.location.lat, station.location.lng]} icon={getIcon(station.status, "weather")}>
              <Popup className="station-popup">
                <div className="w-full max-w-[320px] sm:max-w-[350px] flex flex-col">
                  {/* Header */}
                  <div className="bg-primary text-white p-3 rounded-t-lg flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-base line-clamp-2">{station.name}</h3>
                      {getStatusBadge(station.status)}
                    </div>
                    <div className="flex justify-between items-center text-xs text-white/90">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 
                        {formatDate(station.lastUpdated)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full">
                        ISMMA2300
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-3 border-x border-b rounded-b-lg bg-white dark:bg-gray-900">
                    {/* Main readings */}
                    <div className="flex flex-col gap-3">
                      {/* Temperature & ET0 - Main readings */}
                      <div className="flex w-full justify-between p-2 border rounded-lg shadow-sm bg-background dark:bg-gray-800">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 p-1.5 rounded-full">
                            <Thermometer className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">{t("sensors.temperature")}</div>
                            <div className="text-base font-semibold">{station.sensors.temperature.toFixed(1)} °C</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">ET₀</div>
                          <div className="text-base font-semibold">{station.sensors.et0.toFixed(2)} {t("units.et0")}</div>
                        </div>
                      </div>

                      {/* Other Sensors - Grid for small screens, flex for larger */}
                      <div className="grid grid-cols-2 w-full gap-2">
                        <div className="flex flex-col p-2 border rounded-lg shadow-sm bg-background dark:bg-gray-800">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Wind className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs text-muted-foreground">{t("sensors.wind")}</span>
                          </div>
                          <div className="text-sm font-semibold">
                            {station.sensors.windSpeed.toFixed(1)} {t("units.wind")}
                        </div>
                      </div>

                        <div className="flex flex-col p-2 border rounded-lg shadow-sm bg-background dark:bg-gray-800">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Sun className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs text-muted-foreground">{t("sensors.solar")}</span>
                          </div>
                          <div className="text-sm font-semibold">
                            {station.sensors.solarRadiation.toFixed(0)} {t("units.solar")}
                        </div>
                      </div>
                    </div>

                      {/* Actions - Always full width buttons */}
                      <div className="flex items-center gap-2 mt-1">
                        <Button asChild className="flex-1 h-8 text-xs sm:text-sm">
                        <Link href={`/stations/details/${station.id}`}>
                            <Info className="mr-1 h-3.5 w-3.5" />
                          {t("stations.details")}
                        </Link>
                      </Button>
                        <Button asChild variant="outline" className="flex-1 h-8 text-xs sm:text-sm">
                        <Link href={`/stations/sensor-logs/${station.id}`}>
                            <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
                          {language === "en" ? "Logs" : "บันทึก"}
                        </Link>
                      </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
      </div>

      {/* Water Stations Group */}
      <div className="water-stations-group">
        {waterStations.map((station) => (
          <div key={`water-${station.id}`}>
            {/* Pulse effect for active stations */}
            {station.status === "online" && (
              <CircleMarker
                center={[station.location.lat, station.location.lng]}
                radius={20}
                pathOptions={{
                  color: "#3b82f6", // Blue for water
                  fillColor: "#3b82f6",
                  fillOpacity: 0.2,
                }}
                className="animate-pulse"
              />
            )}

            <Marker position={[station.location.lat, station.location.lng]} icon={getIcon(station.status, "water")}>
              <Popup className="station-popup">
                <div className="w-full max-w-[320px] sm:max-w-[350px] flex flex-col">
                  {/* Header */}
                  <div className="bg-blue-600 text-white p-3 rounded-t-lg flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-base line-clamp-2">{station.name}</h3>
                      {getStatusBadge(station.status)}
                    </div>
                    <div className="flex justify-between items-center text-xs text-white/90">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 
                        {formatDate(station.lastUpdated)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full">
                        DQA230.1
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-3 border-x border-b rounded-b-lg bg-white dark:bg-gray-900">
                    {/* Main readings */}
                    <div className="flex flex-col gap-3">
                      {/* Main water metrics */}
                      <div className="grid grid-cols-2 w-full gap-2">
                        <div className="flex flex-col p-2 border rounded-lg shadow-sm bg-background dark:bg-gray-800">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Cloud className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-xs text-muted-foreground">{t("stations.rainfall")}</span>
                          </div>
                          <div className="text-sm font-semibold">
                            {station.sensors.rainfall.toFixed(2)} {t("units.rainfall")}
                          </div>
                        </div>
                        
                        <div className="flex flex-col p-2 border rounded-lg shadow-sm bg-background dark:bg-gray-800">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Droplet className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-xs text-muted-foreground">{t("stations.water.level")}</span>
                          </div>
                          <div className="text-sm font-semibold">
                            {station.sensors.waterLevel.toFixed(2)} {t("units.water.level")}
                          </div>
                        </div>
                      </div>

                      {/* Latest rain data with hourly and daily */}
                      <div className="w-full p-2 border rounded-lg shadow-sm bg-background dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Cloud className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-xs text-muted-foreground">{language === "en" ? "Rainfall Summary" : "สรุปปริมาณน้ำฝน"}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-1.5">
                          <div>
                            <div className="text-xs text-muted-foreground">{language === "en" ? "Hourly" : "รายชั่วโมง"}</div>
                            <div className="text-sm font-semibold">{(station.sensors.rainfall * 0.2).toFixed(2)} {t("units.rainfall")}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">{language === "en" ? "Daily" : "รายวัน"}</div>
                            <div className="text-sm font-semibold">{station.sensors.rainfall.toFixed(2)} {t("units.rainfall")}</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                      <div className="flex items-center gap-2 mt-1">
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white flex-1 h-8 text-xs sm:text-sm">
                        <Link href={`/stations/details/${station.id}`}>
                            <Info className="mr-1 h-3.5 w-3.5" />
                          {t("stations.details")}
                        </Link>
                      </Button>
                        <Button asChild variant="outline" className="flex-1 h-8 text-xs sm:text-sm">
                        <Link href={`/stations/sensor-logs/${station.id}`}>
                            <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
                          {language === "en" ? "Logs" : "บันทึก"}
                        </Link>
                      </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
      </div>
    </MapContainer>
  )
}
