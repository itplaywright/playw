"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [availableThemes, setAvailableThemes] = React.useState<string[]>(["light", "dark", "system"])

  React.useEffect(() => {
    setMounted(true)
    fetchAvailableThemes()
  }, [])

  const fetchAvailableThemes = async () => {
    try {
      const res = await fetch("/api/public/config")
      if (res.ok) {
        const data = await res.json()
        if (data.settings?.available_themes) {
          setAvailableThemes(data.settings.available_themes.split(","))
        }
      }
    } catch (error) {
      console.error("Error fetching available themes:", error)
    }
  }

  // Effect to ensure current theme is allowed
  React.useEffect(() => {
    if (mounted && availableThemes.length > 0 && !availableThemes.includes(theme || "")) {
      // Fallback to the first available theme if current is disallowed
      setTheme(availableThemes[0])
    }
  }, [mounted, availableThemes, theme, setTheme])

  if (!mounted || availableThemes.length <= 1) {
    if (!mounted) return <div className="h-9 w-9 rounded-xl bg-muted/50 border border-border animate-pulse" />
    return null
  }

  const toggleTheme = () => {
    const currentIndex = availableThemes.indexOf(theme || "system")
    const nextIndex = (currentIndex + 1) % availableThemes.length
    setTheme(availableThemes[nextIndex])
  }

  const renderIcon = () => {
    if (theme === "dark") return <Moon className="h-[18px] w-[18px] text-blue-400 group-hover:text-blue-300 transition-colors" />
    if (theme === "light") return <Sun className="h-[18px] w-[18px] text-amber-500 group-hover:text-amber-600 transition-colors" />
    return <Monitor className="h-[18px] w-[18px] text-purple-500 group-hover:text-purple-600 transition-colors" />
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative h-9 w-9 rounded-xl flex items-center justify-center bg-secondary/50 hover:bg-secondary border border-border transition-all duration-300 group overflow-hidden"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: 20, opacity: 0, rotate: 45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: -45 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {renderIcon()}
        </motion.div>
      </AnimatePresence>
      
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300" />
    </button>
  )
}
