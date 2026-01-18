"use client"

import { useEffect, useRef } from "react"

interface WaveformProps {
   frequencyData: number[]
   isActive: boolean
}

export function Waveform({ frequencyData, isActive }: WaveformProps) {
   const canvasRef = useRef<HTMLCanvasElement>(null)

   useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const width = canvas.width
      const height = canvas.height

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      if (!isActive || frequencyData.length === 0) return

      // Draw waveform - bars anchored to bottom
      const barCount = frequencyData.length
      const barWidth = width / barCount
      const gap = 1

      frequencyData.forEach((value, i) => {
         const normalizedValue = value / 255
         const barHeight = Math.min(height, normalizedValue * height) // Natural height without stretching
         const y = height - barHeight // Anchor to bottom
         const x = i * barWidth // Calculate x position based on index

         // Color gradient based on height
         const hue = 270 // Purple
         const opacity = 0.3 + normalizedValue * 0.4 // Dynamic opacity

         ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${opacity})`
         ctx.fillRect(x, y, barWidth - gap, barHeight)
      })
   }, [frequencyData, isActive])

   return (
      <canvas
         ref={canvasRef}
         width={320}
         height={320}
         className="absolute inset-0 w-full h-full"
         style={{ zIndex: 0 }}
      />
   )
}
