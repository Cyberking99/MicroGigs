"use client"

import { useEffect, useState } from "react"
import { MicroGigsLogo } from "./logo"

interface SplashScreenProps {
  onComplete?: () => void
  minDisplayTime?: number
}

export function SplashScreen({ onComplete, minDisplayTime = 2000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = prev + (100 - prev) / 10
        return newProgress > 99 ? 100 : newProgress
      })
    }, 100)

    const timer = setTimeout(() => {
      clearInterval(interval)
      setLoadingProgress(100)
      
      setTimeout(() => {
        setIsVisible(false)
        if (onComplete) onComplete()
      }, 300)
    }, minDisplayTime)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [minDisplayTime, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500">
      <div className="flex flex-col items-center">
        <div className="animate-pulse">
          <MicroGigsLogo size="xl" />
        </div>
        
        <p className="mt-4 text-zinc-400 text-sm">Decentralized Task Marketplace</p>
        
        <div className="mt-8 w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        
        <div className="mt-2 text-xs text-zinc-500">
          {loadingProgress < 100 ? "Loading..." : "Ready"}
        </div>
      </div>
      
      <div className="absolute bottom-8 text-xs text-zinc-600">
        Powered by Blockchain
      </div>
    </div>
  )
}
