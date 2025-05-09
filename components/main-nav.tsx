"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Menu, Moon, Sun, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/useAuth"
import { useLanguage } from "@/components/language-provider"
import { useAlerts } from "@/hooks/useAlerts"
import { MainSidebar } from "@/components/main-sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

const MainNav = () => {
  const { user, logout } = useAuth()
  const { setTheme, resolvedTheme } = useTheme()
  const { language, changeLanguage, t } = useLanguage()
  const { pendingCount } = useAlerts()
  const pathname = usePathname()
  const isDark = resolvedTheme === "dark"
  const [scrolled, setScrolled] = useState(false)

  // Track scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (pathname === "/login") return null

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur-sm transition-all duration-200 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-2 sm:px-4 mx-auto max-w-[1920px]">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <MainSidebar />
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="relative h-9 w-9 flex items-center justify-center bg-primary/10 rounded-full p-1.5">
              <img 
                src="/logo.svg" 
                alt="Monitoring System Logo" 
                className="h-6 w-auto"
                style={{ filter: isDark ? 'invert(1)' : 'none' }}
                loading="eager"
              />
            </div>
            <span className="text-base font-bold hidden sm:inline-block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {language === "en" ? "Monitoring System" : "ระบบติดตาม"}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/alerts">
                  <Button variant="ghost" size="icon" className="relative hover:bg-primary/10">
                    <Bell className="h-5 w-5" />
                    {pendingCount > 0 && (
                      <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center shadow-sm">
                        {pendingCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>{t("alerts.title")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 hover:bg-primary/10">
                <span className="font-medium text-xs">{language === "en" ? "EN" : "TH"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => changeLanguage("en")} className="cursor-pointer">
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage("th")} className="cursor-pointer">
                ไทย
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 hover:bg-primary/10">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                <Sun className="h-4 w-4 mr-2" /> {t("app.light")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                <Moon className="h-4 w-4 mr-2" /> {t("app.dark")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
                {t("app.system")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 hover:bg-primary/10">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem disabled className="text-xs md:text-sm opacity-70">
                {user?.name} ({user?.role})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500 focus:text-red-600">
                {t("app.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export { MainNav }
export default MainNav
