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
        const isLeftHalf = position < 0.5
        const distFromCenter = Math.abs(position - 0.5) * 2

        // Mix bass and treble based on position
        const bassInfluence = isLeftHalf ? 1 - distFromCenter : distFromCenter
        const trebleInfluence = 1 - bassInfluence

        const height = isActive ? 8 + (audioData.bass * bassInfluence + audioData.treble * trebleInfluence) * 48 : 8

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
