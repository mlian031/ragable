"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function SimpleThemeToggle() {
  const { theme, setTheme } = useTheme()
  // State to track if the component has mounted
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  // Don't render the theme-specific part until mounted
  if (!mounted) {
    // Render a placeholder or null to avoid mismatch
    // A button shell without the icon/text is often suitable
    return (
       <Button
         variant="ghost"
         size="sm"
         className="flex items-center space-x-1 px-2 py-1 h-auto text-xs"
         disabled // Disable until mounted to prevent interaction before theme is known
       >
         {/* Optional: Placeholder icon or skeleton */}
         <span className="sr-only">Toggle theme</span>
       </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center space-x-1 px-2 py-1 h-auto text-xs"
    >
      {theme === "light" ? (
        <Moon className="h-3 w-3" />
      ) : (
        <Sun className="h-3 w-3" />
      )}
      <span className="ml-1">{theme === "light" ? "Dark" : "Light"}</span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
