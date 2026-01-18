"use client"

import { useState, useEffect, useRef } from "react"
import type { AudioData, Mood } from "@/hooks/use-audio-capture"
import { SPRITE_FRAMES, MOOD_SPRITES, FRAME_SPEEDS, GLOW_COLORS } from "./sprite-constants"
import { BlobEye, BlobMouth } from "./blob-character"

type MoodLock = "auto" | Mood

interface DesktopBuddyProps {
   audioData: AudioData
   isActive: boolean
   useCustomSprites: boolean
   hasFrameSprites: boolean
   moodLock: MoodLock
   transparentMode: boolean
}

export function DesktopBuddy({
   audioData,
   isActive,
   useCustomSprites,
   hasFrameSprites,
   moodLock,
   transparentMode
}: DesktopBuddyProps) {
   const effectiveMood = moodLock !== "auto" ? moodLock : audioData.mood

   const [currentFrame, setCurrentFrame] = useState(0)
   const [bounce, setBounce] = useState(0)
   const [rotation, setRotation] = useState(0)
   const [scale, setScale] = useState({ x: 1, y: 1 })

   const frameTimerRef = useRef<NodeJS.Timeout | null>(null)
   const animationRef = useRef<number | null>(null)
   const timeRef = useRef(0)
   const lastBeatRef = useRef(0)
   const bounceVelocityRef = useRef(0)
   const bouncePositionRef = useRef(0)
   const rotationRef = useRef(0)

   useEffect(() => {
      if (!isActive || !audioData.isActive) {
         setBounce(0)
         setRotation(0)
         setScale({ x: 1, y: 1 })
         setCurrentFrame(0)
         bounceVelocityRef.current = 0
         bouncePositionRef.current = 0
         rotationRef.current = 0
      }
   }, [isActive, audioData.isActive])

   useEffect(() => {
      if (!isActive || !hasFrameSprites) return

      const frames = SPRITE_FRAMES[effectiveMood]
      const baseSpeed = FRAME_SPEEDS[effectiveMood]

      const bpmSpeed = audioData.bpm > 0 ? 60000 / audioData.bpm / frames.length : baseSpeed
      const speed = Math.max(80, Math.min(bpmSpeed, baseSpeed))

      frameTimerRef.current = setInterval(() => {
         setCurrentFrame((prev) => (prev + 1) % frames.length)
      }, speed)

      return () => {
         if (frameTimerRef.current) clearInterval(frameTimerRef.current)
      }
   }, [isActive, effectiveMood, audioData.bpm, hasFrameSprites])

   useEffect(() => {
      if (audioData.beat && isActive) {
         lastBeatRef.current = Date.now()

         const intensity =
            effectiveMood === "energetic" ? -40 :
               effectiveMood === "happy" ? -25 :
                  effectiveMood === "sad" ? -5 :
                     effectiveMood === "sleep" ? -2 : -15

         bounceVelocityRef.current = intensity * (0.8 + audioData.energy * 0.5)
      }
   }, [audioData.beat, audioData.energy, effectiveMood, isActive])

   useEffect(() => {
      if (!isActive) return

      const animate = () => {
         timeRef.current += 16

         const springStrength = 0.15
         const damping = 0.8
         bounceVelocityRef.current += -bouncePositionRef.current * springStrength
         bounceVelocityRef.current *= damping
         bouncePositionRef.current += bounceVelocityRef.current

         let idleRotation = 0
         if (effectiveMood === "energetic") {
            idleRotation = Math.sin(timeRef.current / 150) * 12
         } else if (effectiveMood === "happy") {
            idleRotation = Math.sin(timeRef.current / 300) * 8
         } else if (effectiveMood === "chill") {
            idleRotation = Math.sin(timeRef.current / 800) * 5
         } else if (effectiveMood === "sleep") {
            idleRotation = Math.sin(timeRef.current / 2000) * 2
         } else {
            idleRotation = Math.sin(timeRef.current / 1500) * 2
         }

         rotationRef.current += (idleRotation - rotationRef.current) * 0.1

         const squashAmount = Math.abs(bouncePositionRef.current) * 0.012
         const scaleY = 1 - squashAmount * 0.5
         const scaleX = 1 + squashAmount * 0.3
         const breathe = 1 + Math.sin(timeRef.current / 600) * 0.02

         setBounce(bouncePositionRef.current)
         setRotation(rotationRef.current)
         setScale({ x: scaleX * breathe, y: scaleY * breathe })

         animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)
      return () => {
         if (animationRef.current) cancelAnimationFrame(animationRef.current)
      }
   }, [isActive, effectiveMood])

   const getCurrentSprite = () => {
      if (hasFrameSprites) {
         const frames = SPRITE_FRAMES[effectiveMood]
         return frames[currentFrame] || frames[0]
      }
      return MOOD_SPRITES[effectiveMood]
   }

   if (useCustomSprites) {
      return (
         <div className="relative">
            {!transparentMode && (
               <div
                  className="absolute inset-0 rounded-full blur-3xl"
                  style={{
                     backgroundColor: GLOW_COLORS[effectiveMood],
                     transform: `scale(${1.5 + audioData.energy * 0.8 + (audioData.beat ? 0.3 : 0)})`,
                     opacity: 0.6 + audioData.energy * 0.4,
                     transition: "background-color 0.5s ease-out, transform 0.1s ease-out",
                  }}
               />
            )}

            <div
               className="relative w-48 h-48"
               style={{
                  transformOrigin: "center bottom",
                  transform: `
              translateY(${bounce}px)
              rotate(${rotation}deg)
              scaleX(${scale.x})
              scaleY(${scale.y})
            `,
               }}
            >
               <img
                  src={getCurrentSprite() || "/placeholder.svg"}
                  alt={`${effectiveMood} buddy`}
                  className="w-full h-full object-contain"
                  style={{
                     filter: transparentMode ? "none" : `drop-shadow(0 0 ${15 + audioData.energy * 20}px ${GLOW_COLORS[effectiveMood]})`,
                  }}
                  onError={(e) => {
                     e.currentTarget.src = MOOD_SPRITES[effectiveMood]
                  }}
               />
            </div>
         </div>
      )
   }

   return (
      <div
         className="relative"
         style={{
            transform: `translateY(${bounce}px) rotate(${rotation}deg) scaleX(${scale.x}) scaleY(${scale.y})`,
         }}
      >
         {!transparentMode && (
            <div
               className="absolute inset-0 rounded-full blur-2xl transition-all duration-500"
               style={{
                  backgroundColor: GLOW_COLORS[effectiveMood],
                  transform: `scale(${1.2 + audioData.energy * 0.3})`,
               }}
            />
         )}
         <div
            className={`relative w-40 h-40 rounded-full transition-all duration-500 ${transparentMode
                  ? "bg-transparent"
                  : effectiveMood === "chill"
                     ? "bg-linear-to-br from-cyan-400 to-blue-500"
                     : effectiveMood === "happy"
                        ? "bg-linear-to-br from-yellow-400 to-amber-500"
                        : effectiveMood === "sad"
                           ? "bg-linear-to-t from-indigo-400 to-purple-500"
                           : effectiveMood === "sleep"
                              ? "bg-linear-to-br from-purple-300 to-indigo-400"
                              : "bg-linear-to-br from-orange-400 to-red-500"
               }`}
         >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <div className="flex gap-6 -mt-2">
                  <BlobEye mood={effectiveMood} beat={audioData.beat} />
                  <BlobEye mood={effectiveMood} beat={audioData.beat} />
               </div>
               <div className="mt-3">
                  <BlobMouth mood={effectiveMood} />
               </div>
               {(effectiveMood === "happy" || effectiveMood === "energetic") && (
                  <>
                     <div className="absolute left-5 top-1/2 w-5 h-2.5 rounded-full bg-pink-400/40" />
                     <div className="absolute right-5 top-1/2 w-5 h-2.5 rounded-full bg-pink-400/40" />
                  </>
               )}
            </div>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-44">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 border-t-[6px] border-slate-700 rounded-t-full" />
               <div className="absolute -left-1 top-3 w-8 h-10 bg-slate-700 rounded-lg">
                  <div className="absolute inset-1 bg-slate-600 rounded" />
               </div>
               <div className="absolute -right-1 top-3 w-8 h-10 bg-slate-700 rounded-lg">
                  <div className="absolute inset-1 bg-slate-600 rounded" />
               </div>
            </div>
         </div>
      </div>
   )
}
