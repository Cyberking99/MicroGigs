import React from "react"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "simple"
  className?: string
}

export function MicroGigsLogo({ size = "md", variant = "default", className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-20 h-20",
  }

  if (variant === "simple") {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="20" fill="#0052FF" />
          <path
            d="M20 10L13 14.5V23.5L20 28L27 23.5V14.5L20 10Z"
            fill="#000000"
            stroke="#0052FF"
            strokeWidth="1.5"
          />
          <path
            d="M20 16L16 18V22L20 24L24 22V18L20 16Z"
            fill="#0052FF"
            stroke="#000000"
            strokeWidth="1.5"
          />
          <path d="M13 14.5L20 19L27 14.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M20 19L20 28" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="20" fill="#0052FF" />
          <path
            d="M20 10L13 14.5V23.5L20 28L27 23.5V14.5L20 10Z"
            fill="#000000"
            stroke="#0052FF"
            strokeWidth="1.5"
          />
          <path
            d="M20 16L16 18V22L20 24L24 22V18L20 16Z"
            fill="#0052FF"
            stroke="#000000"
            strokeWidth="1.5"
          />
          <path d="M13 14.5L20 19L27 14.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M20 19L20 28" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      {size !== "sm" && (
        <div className={`ml-2 font-bold ${size === "xl" ? "text-2xl" : size === "lg" ? "text-xl" : "text-base"}`}>
          MicroGigs
        </div>
      )}
    </div>
  )
}
