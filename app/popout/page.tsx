"use client"

import { useAudioCapture } from "@/hooks/use-audio-capture"
import { PNGTuber } from "@/components/pngtuber"
import { Particles } from "@/components/particles"
import { Waveform } from "@/components/waveform"
import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"
import type { AudioData, Mood } from "@/components/music-companion"
import { useState, useEffect, useRef } from "react"

export default function PopoutPage() {
  const { isListening, audioData: rawAudioData, error, startCapture, stopCapture } = useAudioCapture()

  // Mood stabilization (same logic as desktop for consistency)
  const [displayedMood, setDisplayedMood] = useState<Mood>("chill")
  const moodHistoryRef = useRef<Mood[]>([])
  const lastMoodChangeRef = useRef(Date.now())
  const MOOD_CHANGE_DELAY = 2000
  const MOOD_HISTORY_SIZE = 100

  useEffect(() => {
    if (!isListening) {
      setDisplayedMood("chill")
      moodHistoryRef.current = []
      lastMoodChangeRef.current = Date.now()
      return
    }

    moodHistoryRef.current.push(rawAudioData.mood as Mood)
    if (moodHistoryRef.current.length > MOOD_HISTORY_SIZE) {
      moodHistoryRef.current.shift()
    }

    const timeSinceLastChange = Date.now() - lastMoodChangeRef.current
    if (timeSinceLastChange < MOOD_CHANGE_DELAY) return

    const moodCounts: Record<Mood, number> = { chill: 0, happy: 0, sad: 0, energetic: 0 }
    moodHistoryRef.current.forEach((m) => moodCounts[m]++)

    const total = moodHistoryRef.current.length
    const threshold = total * 0.4

    let dominantMood: Mood | null = null
    for (const [mood, count] of Object.entries(moodCounts)) {
      if (count >= threshold) {
        dominantMood = mood as Mood
        break
      }
    }

    if (dominantMood && dominantMood !== displayedMood) {
      console.log('[POPOUT-MOOD-DBG] Changing mood:', {
        from: displayedMood,
        to: dominantMood,
        counts: moodCounts,
        timeSinceLastChange,
        historySize: moodHistoryRef.current.length
      })
      setDisplayedMood(dominantMood)
      lastMoodChangeRef.current = Date.now()
      moodHistoryRef.current = []
    }
  }, [rawAudioData.mood, isListening, displayedMood])

  const audioData: AudioData = {
    bpm: rawAudioData.bpm,
    mood: displayedMood,
    energy: rawAudioData.energy,
    beat: rawAudioData.beat,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
      {/* Compact character display */}
      <div className="relative w-56 h-56 mb-4">
        <Waveform frequencyData={rawAudioData.frequencyData} isActive={isListening} />
        <Particles audioData={audioData} isActive={isListening} />
        <PNGTuber audioData={audioData} isActive={isListening} />
      </div>

      <div className="flex gap-2 text-center mb-2 flex-wrap justify-center">
        <div className="bg-card/50 rounded-lg px-3 py-2 backdrop-blur border border-border">
          <p className="text-lg font-bold text-foreground">{audioData.bpm || "—"}</p>
          <p className="text-[10px] text-muted-foreground uppercase">BPM</p>
        </div>
        <div className="bg-card/50 rounded-lg px-3 py-2 backdrop-blur border border-border">
          <p className="text-lg font-bold text-foreground capitalize">{audioData.mood}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Mood</p>
        </div>
        <div className="bg-card/50 rounded-lg px-3 py-2 backdrop-blur border border-border">
          <p className="text-lg font-bold text-foreground">{Math.round(audioData.energy * 100)}%</p>
          <p className="text-[10px] text-muted-foreground uppercase">Energy</p>
        </div>
      </div>

      {/* Controls */}
      {!isListening ? (
        <Button
          size="sm"
          onClick={() => startCapture()}
          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full"
        >
          <Mic className="mr-2 h-4 w-4" />
          Start
        </Button>
      ) : (
        <Button size="sm" variant="destructive" onClick={stopCapture} className="rounded-full">
          <Square className="mr-2 h-4 w-4" />
          Stop
        </Button>
      )}

      {error && <p className="text-destructive text-xs mt-2">{error}</p>}
    </div>
  )
}
