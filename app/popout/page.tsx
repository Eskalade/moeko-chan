"use client"

import { useAudioCapture } from "@/hooks/use-audio-capture"
import { PNGTuber } from "@/components/pngtuber"
import { Particles } from "@/components/particles"
import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"
import type { AudioData, Mood } from "@/components/music-companion"

export default function PopoutPage() {
  const { isListening, audioData: rawAudioData, error, startCapture, stopCapture } = useAudioCapture()

  const audioData: AudioData = {
    bpm: rawAudioData.bpm,
    mood: rawAudioData.mood as Mood,
    energy: rawAudioData.energy,
    bass: rawAudioData.bassLevel,
    treble: rawAudioData.trebleLevel,
    beat: rawAudioData.isActive && rawAudioData.bassLevel > 0.5,
  }

  const genre = rawAudioData.genre || "Unknown"
  const danceability = rawAudioData.danceability || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
      {/* Compact character display */}
      <div className="relative w-56 h-56 mb-4">
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

      <div className="flex gap-2 text-center mb-4 flex-wrap justify-center">
        <div className="bg-card/50 rounded-lg px-3 py-1.5 backdrop-blur border border-border">
          <p className="text-sm font-bold text-foreground capitalize">{genre}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Genre</p>
        </div>
        <div className="bg-card/50 rounded-lg px-3 py-1.5 backdrop-blur border border-border">
          <p className="text-sm font-bold text-foreground">{Math.round(danceability * 100)}%</p>
          <p className="text-[10px] text-muted-foreground uppercase">Danceable</p>
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
