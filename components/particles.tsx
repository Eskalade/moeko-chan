"use client"

import { useEffect, useState, useRef } from "react"
import type { AudioData, Mood } from "./music-companion"

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  type: "note" | "sparkle" | "wave"
  rotation: number
  rotationSpeed: number
}

const MOOD_PARTICLE_COLORS: Record<Mood, string> = {
  chill: "text-cyan-400",
  energetic: "text-orange-400",
  sad: "text-indigo-400",
  happy: "text-yellow-400",
}

interface ParticlesProps {
  audioData: AudioData
  isActive: boolean
}

export function Particles({ audioData, isActive }: ParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const idCounterRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Spawn particles on beats
  useEffect(() => {
    if (!isActive || audioData.energy < 0.2) return

    const spawnRate = audioData.energy > 0.6 ? 150 : audioData.energy > 0.4 ? 300 : 500

    const interval = setInterval(() => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Spawn from character center with outward velocity
      const angle = Math.random() * Math.PI * 2
      const speed = 1 + audioData.energy * 3

      const types: Particle["type"][] = ["note", "sparkle", "wave"]
      const type = types[Math.floor(Math.random() * types.length)]

      const newParticle: Particle = {
        id: idCounterRef.current++,
        x: centerX + (Math.random() - 0.5) * 60,
        y: centerY + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // Slight upward bias
        size: 12 + Math.random() * 16,
        opacity: 0.8 + Math.random() * 0.2,
        type,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      }

      setParticles((prev) => [...prev.slice(-30), newParticle]) // Keep max 30 particles
    }, spawnRate)

    return () => clearInterval(interval)
  }, [isActive, audioData.energy])

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return

    const animationFrame = requestAnimationFrame(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.02, // Gentle gravity
            opacity: p.opacity - 0.015,
            rotation: p.rotation + p.rotationSpeed,
          }))
          .filter((p) => p.opacity > 0),
      )
    })

    return () => cancelAnimationFrame(animationFrame)
  }, [particles])

  if (!isActive) return null

  const colorClass = MOOD_PARTICLE_COLORS[audioData.mood]

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute ${colorClass} transition-colors duration-500`}
          style={{
            left: particle.x,
            top: particle.y,
            fontSize: particle.size,
            opacity: particle.opacity,
            transform: `translate(-50%, -50%) rotate(${particle.rotation}deg)`,
          }}
        >
          {particle.type === "note" && (Math.random() > 0.5 ? "♪" : "♫")}
          {particle.type === "sparkle" && "✦"}
          {particle.type === "wave" && "〰"}
        </div>
      ))}
    </div>
  )
}
