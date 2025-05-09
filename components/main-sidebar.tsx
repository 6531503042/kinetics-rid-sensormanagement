"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AlertTriangle, BarChart3, Home, Map, Settings, Droplet, Gauge } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

const MainSidebar = () => {
  const pathname = usePathname()
  const { t, language } = useLanguage()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const routes = [
    {
      href: "/dashboard",
      icon: Home,
      title: t("dashboard.title"),
    },
    {
      href: "/stations/map",
      icon: Map,
      title: t("stations.map"),
    },
    {
      href: "/stations/list",
      icon: BarChart3,
      title: t("stations.list"),
    },
    {
      href: "/alerts",
      icon: AlertTriangle,
      title: t("alerts.title"),
    },
  ]

  return (
    <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-[240px] flex flex-col border-r bg-card/30 backdrop-blur-sm shadow-md z-30 transform transition-transform duration-300 md:translate-x-0 -translate-x-full md:shadow-lg">
      <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
        <div className="px-3 py-4">
          <div className="h-[1px] w-full bg-border/40" />
        </div>
        
        <div className="space-y-1.5 px-1.5">
          {routes.map((route) => {
            const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
            
            return (
              <Button
                key={route.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start transition-all duration-150",
                  isActive
                    ? "bg-primary/10 font-medium text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                )}
                asChild
              >
                <Link href={route.href} className="group">
                  <route.icon className={cn(
                    "mr-2 h-4.5 w-4.5 transition-all",
                    isActive
                      ? "text-primary" 
                      : "text-muted-foreground group-hover:text-primary/80"
                  )} />
                  {route.title}
                </Link>
              </Button>
            );
          })}
        </div>
        
        <div className="mt-auto px-5 py-6">
          <div className="rounded-lg bg-card/80 border border-border/40 p-4 text-xs shadow-sm">
            <p className="mb-2 font-medium text-foreground">Irrigation Department</p>
            <p className="text-muted-foreground">Sensor Management System</p>
            <div className="mt-3 text-[11px] text-muted-foreground/70">
              v1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { MainSidebar }
export default MainSidebar
