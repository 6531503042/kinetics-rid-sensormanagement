"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import { AuthProvider } from "@/hooks/useAuth"
import { MainNav } from "@/components/main-nav"
import { MainSidebar } from "@/components/main-sidebar"

// Use dynamic imports for performance improvements
const DynamicMainNav = dynamic(() => import("@/components/main-nav").then(mod => ({ default: mod.MainNav })), {
  ssr: false,
  loading: () => (
    <header className="sticky top-0 z-40 border-b bg-background h-16 w-full animate-pulse" />
  )
})

const DynamicMainSidebar = dynamic(() => import("@/components/main-sidebar").then(mod => ({ default: mod.MainSidebar })), {
  ssr: false,
  loading: () => (
    <div className="fixed top-16 left-0 w-[240px] h-[calc(100vh-4rem)] bg-background animate-pulse" />
  )
})

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <AuthProvider>
      {!isLoginPage && (
        <div className="flex min-h-screen flex-col bg-background">
          <DynamicMainNav />
          <div className="flex flex-1 relative">
            <DynamicMainSidebar />
            <main className="flex-1 ml-0 md:ml-[240px] px-2 sm:px-4 py-3 max-w-full overflow-x-hidden mt-16">
              <div className="mx-auto max-w-[1600px]">
                <Suspense fallback={<div className="w-full h-32 animate-pulse bg-muted/30 rounded-md"></div>}>
                  {children}
                </Suspense>
              </div>
            </main>
          </div>
        </div>
      )}

      {isLoginPage && children}
    </AuthProvider>
  )
}
