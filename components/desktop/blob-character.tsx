"use client"

import { useState, useEffect } from "react"
import type { Mood } from "@/hooks/use-audio-capture"

export function BlobEye({ mood, beat }: { mood: Mood; beat: boolean }) {
   const [blink, setBlink] = useState(false)

   useEffect(() => {
      const interval = setInterval(() => {
         if (Math.random() > 0.7) {
            setBlink(true)
            setTimeout(() => setBlink(false), 150)
         }
      }, 2500)
      return () => clearInterval(interval)
   }, [])

   const squeezed = (beat && mood === "energetic") || blink

   if (mood === "sad") {
      return (
         <div className="relative">
            <div className={`w-5 ${squeezed ? "h-0.5" : "h-3"} bg-slate-800 rounded-full transition-all`} />
            <div className="absolute -top-1.5 w-6 h-0.5 bg-slate-700 rounded-full -rotate-12" />
         </div>
      )
   }

   return (
      <div
         className={`w-5 ${squeezed ? "h-0.5" : mood === "happy" ? "h-4" : "h-5"} bg-slate-800 rounded-full transition-all relative`}
      >
         {!squeezed && <div className="absolute top-0.5 left-1 w-1.5 h-1.5 bg-white rounded-full" />}
      </div>
   )
}

export function BlobMouth({ mood }: { mood: Mood }) {
   if (mood === "sad") {
      return <div className="w-6 h-3 border-b-[3px] border-slate-800 rounded-b-full rotate-180" />
   }
   if (mood === "energetic") {
      return (
         <div className="w-8 h-5 bg-slate-800 rounded-full flex items-end justify-center pb-0.5">
            <div className="w-5 h-1.5 bg-pink-400 rounded-full" />
         </div>
      )
   }
   if (mood === "happy") {
      return <div className="w-8 h-4 border-b-[3px] border-slate-800 rounded-b-full" />
   }
   return <div className="w-5 h-2 border-b-[3px] border-slate-800 rounded-b-full" />
}
