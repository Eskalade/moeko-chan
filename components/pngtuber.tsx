"use client"

import { useEffect, useRef, useState } from "react"
import type { AudioData, Mood } from "./music-companion"

interface PNGTuberProps {
  audioData: AudioData
  isActive: boolean
  customImage?: string | null
}

const MOOD_COLORS: Record<Mood, { bg: string; glow: string; face: string }> = {
  chill: {
    bg: "from-blue-400 to-cyan-400",
    glow: "shadow-cyan-400/50",
    face: "bg-blue-300",
  },
  energetic: {
    bg: "from-orange-400 to-red-500",
    glow: "shadow-orange-400/50",
    face: "bg-orange-300",
  },
  sad: {
    bg: "from-indigo-400 to-purple-500",
    glow: "shadow-indigo-400/50",
    face: "bg-indigo-300",
  },
  happy: {
    bg: "from-yellow-400 to-amber-500",
    glow: "shadow-yellow-400/50",
    face: "bg-yellow-300",
  },
}

export function PNGTuber({ audioData, isActive, customImage }: PNGTuberProps) {
  const [bounce, setBounce] = useState(0)
  const [squash, setSquash] = useState(1)
  const bounceRef = useRef(0)
  const targetBounceRef = useRef(0)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isActive) {
      setBounce(0)
      setSquash(1)
      return
    }

    const animate = () => {
      bounceRef.current += (targetBounceRef.current - bounceRef.current) * 0.3
      targetBounceRef.current *= 0.9
      const squashAmount = 1 - Math.abs(bounceRef.current) * 0.003

      setBounce(bounceRef.current)
      setSquash(squashAmount)

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive])

  useEffect(() => {
    if (audioData.beat && isActive) {
      targetBounceRef.current = -20 - audioData.energy * 30
    }
  }, [audioData.beat, audioData.energy, isActive])

  const colors = MOOD_COLORS[audioData.mood]
  const breathScale = isActive ? 1 + Math.sin(Date.now() / 500) * 0.02 : 1

  if (customImage) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.bg} blur-3xl opacity-30 transition-all duration-500`}
          style={{
            transform: `scale(${0.8 + audioData.energy * 0.4})`,
          }}
        />

        {/* Custom character */}
        <div
          className="relative transition-all duration-100"
          style={{
            transform: `translateY(${bounce}px) scaleY(${squash}) scaleX(${2 - squash}) scale(${breathScale})`,
          }}
        >
          <img
            src={customImage || "/placeholder.svg"}
            alt="Custom vibe buddy"
            className="w-48 h-48 object-contain drop-shadow-2xl"
            style={{
              filter: `drop-shadow(0 0 20px ${
                audioData.mood === "energetic"
                  ? "rgba(251,146,60,0.5)"
                  : audioData.mood === "happy"
                    ? "rgba(250,204,21,0.5)"
                    : audioData.mood === "sad"
                      ? "rgba(129,140,248,0.5)"
                      : "rgba(34,211,238,0.5)"
              })`,
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Glow effect */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.bg} blur-3xl opacity-30 transition-all duration-500`}
        style={{
          transform: `scale(${0.8 + audioData.energy * 0.4})`,
        }}
      />

      {/* Character container */}
      <div
        className="relative transition-all duration-300"
        style={{
          transform: `translateY(${bounce}px) scaleY(${squash}) scaleX(${2 - squash}) scale(${breathScale})`,
        }}
      >
        {/* Body */}
        <div
          className={`w-48 h-48 rounded-full bg-gradient-to-br ${colors.bg} shadow-2xl ${colors.glow} transition-all duration-500`}
        >
          {/* Face container */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Eyes */}
            <div className="relative flex gap-8 -mt-4">
              <Eye mood={audioData.mood} energy={audioData.energy} beat={audioData.beat} isLeft />
              <Eye mood={audioData.mood} energy={audioData.energy} beat={audioData.beat} />
            </div>
          </div>

          {/* Mouth */}
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2">
            <Mouth mood={audioData.mood} energy={audioData.energy} />
          </div>

          {/* Blush */}
          {(audioData.mood === "happy" || audioData.mood === "energetic") && (
            <>
              <div className="absolute left-6 top-24 w-6 h-3 rounded-full bg-pink-400/40" />
              <div className="absolute right-6 top-24 w-6 h-3 rounded-full bg-pink-400/40" />
            </>
          )}
        </div>

        {/* Headphones */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-52">
          <div className="relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-8 border-t-8 border-slate-700 rounded-t-full" />
            <div className="absolute -left-1 top-4 w-10 h-12 bg-slate-700 rounded-lg shadow-lg">
              <div className="absolute inset-1 bg-slate-600 rounded" />
            </div>
            <div className="absolute -right-1 top-4 w-10 h-12 bg-slate-700 rounded-lg shadow-lg">
              <div className="absolute inset-1 bg-slate-600 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Eye({ mood, energy, beat, isLeft }: { mood: Mood; energy: number; beat: boolean; isLeft?: boolean }) {
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setBlink(true)
        setTimeout(() => setBlink(false), 150)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const squeezeOnBeat = beat && mood === "energetic"

  if (mood === "sad") {
    return (
      <div className="relative">
        <div className={`w-6 h-${blink ? "1" : "4"} bg-slate-800 rounded-full transition-all`} />
        <div
          className="absolute -top-2 w-8 h-1 bg-slate-700 rounded-full"
          style={{ transform: isLeft ? "rotate(-15deg)" : "rotate(15deg)" }}
        />
      </div>
    )
  }

  if (mood === "happy" || mood === "energetic") {
    return (
      <div className={`w-6 ${squeezeOnBeat || blink ? "h-1" : "h-5"} bg-slate-800 rounded-full transition-all`}>
        {!blink && !squeezeOnBeat && <div className="absolute top-0.5 left-1.5 w-2 h-2 bg-white rounded-full" />}
      </div>
    )
  }

  return (
    <div className={`w-6 ${blink ? "h-1" : "h-6"} bg-slate-800 rounded-full transition-all`}>
      {!blink && <div className="absolute top-1 left-1.5 w-2 h-2 bg-white rounded-full" />}
    </div>
  )
}

function Mouth({ mood, energy }: { mood: Mood; energy: number }) {
  if (mood === "sad") {
    return <div className="w-8 h-4 border-b-4 border-slate-800 rounded-b-full transform rotate-180" />
  }

  if (mood === "energetic") {
    return (
      <div className="w-10 h-6 bg-slate-800 rounded-full flex items-end justify-center pb-1">
        <div className="w-6 h-2 bg-pink-400 rounded-full" />
      </div>
    )
  }

  if (mood === "happy") {
    return <div className="w-10 h-5 border-b-4 border-slate-800 rounded-b-full" />
  }

  return <div className="w-6 h-3 border-b-4 border-slate-800 rounded-b-full" />
}
