"use client"

import type { AudioData } from "./music-companion"

interface AudioVisualizerProps {
  audioData: AudioData
  isActive: boolean
}

export function AudioVisualizer({ audioData, isActive }: AudioVisualizerProps) {
  const bars = 20

  return (
    <div className="flex items-end justify-center gap-1 h-16 w-full max-w-md px-4">
      {[...Array(bars)].map((_, i) => {
        // Create a wave pattern based on position and audio data
        const position = i / bars
        const distFromCenter = Math.abs(position - 0.5) * 2

        // Height based on energy with wave pattern
        const waveInfluence = 1 - distFromCenter * 0.3

        const height = isActive ? 8 + (audioData.energy * waveInfluence) * 48 : 8

        const hue = 180 + position * 60 // Cyan to teal gradient

        return (
          <div
            key={i}
            className="w-2 rounded-full transition-all duration-75"
            style={{
              height: `${height}px`,
              backgroundColor: isActive ? `hsl(${hue}, 70%, 60%)` : "#475569",
              boxShadow: isActive && audioData.beat ? `0 0 10px hsl(${hue}, 70%, 60%)` : "none",
            }}
          />
        )
      })}
    </div>
  )
}
