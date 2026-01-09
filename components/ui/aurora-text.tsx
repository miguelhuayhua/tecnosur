"use client"

import React, { memo } from "react"
import { cn } from "@/lib/utils"

interface AuroraTextProps {
  children: React.ReactNode
  className?: string
  colors?: string[]
  speed?: number
}

export const AuroraText = memo(
  ({
    children,
    className = "",
    colors,
    speed = 1,
  }: AuroraTextProps) => {
    // Si no se proporcionan colores, usar primary y secondary por defecto
    const defaultColors = [
      "var(--primary)",
      "var(--secondary)",
      "var(--primary)",
      "var(--secondary)",
    ]
    
    const finalColors = colors && colors.length > 0 
      ? colors 
      : defaultColors

    const gradientStyle = {
      backgroundImage: `linear-gradient(135deg, ${finalColors.join(", ")}, ${
        finalColors[0]
      })`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      animationDuration: `${10 / speed}s`,
      backgroundSize: "200% auto",
    }

    return (
      <span className={cn("relative inline-block", className)}>
        <span className="sr-only">{children}</span>
        <span
          className="animate-aurora relative bg-clip-text text-transparent bg-gradient-to-r"
          style={gradientStyle}
          aria-hidden="true"
        >
          {children}
        </span>
        {/* Efecto de glow sutil */}
        <span
          className="absolute inset-0 animate-aurora bg-clip-text text-transparent blur-sm opacity-30 -z-10"
          style={gradientStyle}
          aria-hidden="true"
        >
          {children}
        </span>
      </span>
    )
  }
)

AuroraText.displayName = "AuroraText"
