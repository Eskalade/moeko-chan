"use client"

import type React from "react"
import { useState } from "react"
import { useAudioCapture, type Mood, type AudioMode } from "@/hooks/use-audio-capture"
import { GripVertical, Bug, ImageIcon, Mic, Monitor } from "lucide-react"
import { Waveform } from "@/components/waveform"
import { DesktopBuddy } from "@/components/desktop/desktop-buddy"
import { DebugPanel } from "@/components/desktop/debug-panel"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useSpriteLoader } from "@/hooks/use-sprite-loader"
import { useElectronTransparent } from "@/hooks/use-electron-transparent"

type MoodLock = "auto" | Mood

export default function DesktopPage() {
  const [showControls, setShowControls] = useState(false)
  const [useCustomSprites, setUseCustomSprites] = useState(true)
  const [showDebug, setShowDebug] = useState(false)
  const [debugExpanded, setDebugExpanded] = useState(false)
  const [inputMode, setInputMode] = useState<AudioMode>("microphone")
  const [moodLock, setMoodLock] = useState<MoodLock>("auto")
  const [transparentMode, setTransparentMode] = useState(false)

  const { isListening, audioData, error, startCapture, stopCapture } = useAudioCapture(inputMode)
  const { spritesLoaded, hasFrameSprites, spriteError } = useSpriteLoader()

  useElectronTransparent()
  useKeyboardShortcuts({
    onToggleDebug: () => setShowDebug((prev) => !prev),
    onToggleDebugExpanded: () => setDebugExpanded((prev) => !prev),
    onToggleTransparent: () => setTransparentMode((prev) => !prev),
  })

  return (
    <div
      className="w-full h-screen bg-transparent overflow-hidden select-none"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Drag handle - hidden in transparent mode */}
      {!transparentMode && (
        <div
          className="absolute top-2 left-0 right-0 h-6 sm:h-8 flex items-center justify-center cursor-move"
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        >
          <GripVertical
            className={`w-6 h-6 sm:w-8 sm:h-8 text-white/50`}
          />
        </div>
      )}

      {/* Mood lock dropdown - left side, hidden in transparent mode */}
      {!transparentMode && (
        <div
          className={`absolute top-2 left-2 transition-opacity ${showControls ? "opacity-100" : "opacity-0"}`}
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <select
            value={moodLock}
            onChange={(e) => setMoodLock(e.target.value as MoodLock)}
            className="p-2 rounded-full bg-black/50 text-white/70 text-sm border-none outline-none cursor-pointer"
            title="Lock mood animation"
          >
            <option value="auto">Auto</option>
            <option value="energetic">Energetic</option>
            <option value="happy">Happy</option>
            <option value="chill">Chill</option>
            <option value="sad">Sad</option>
            <option value="sleep">Sleep</option>
          </select>
        </div>
      )}

      {/* Mini controls - right side, hidden in transparent mode */}
      {!transparentMode && (
        <div
          className={`absolute top-2 right-2 flex gap-1 sm:gap-2 transition-opacity ${showControls ? "opacity-100" : "opacity-0"}`}
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <button
            onClick={() => setInputMode(inputMode === "microphone" ? "system" : "microphone")}
            className={`p-2 sm:p-2.5 md:p-3 rounded-full transition-all ${inputMode === "system" ? "bg-purple-500/70 text-white" : "bg-black/50 hover:bg-black/70 text-white/70 hover:text-white"}`}
            title={inputMode === "microphone" ? "Switch to System Audio" : "Switch to Microphone"}
          >
            {inputMode === "microphone" ? <Mic className="w-6 h-6 sm:w-8 sm:h-8" /> : <Monitor className="w-6 h-6 sm:w-8 sm:h-8" />}
          </button>
          <button
            onClick={() => spritesLoaded && setUseCustomSprites(!useCustomSprites)}
            className={`p-2 sm:p-2.5 md:p-3 rounded-full transition-all ${spritesLoaded
              ? useCustomSprites
                ? "bg-green-500/70 text-white"
                : "bg-black/50 hover:bg-black/70 text-white/70 hover:text-white"
              : "bg-red-500/50 text-white/50 cursor-not-allowed"
              }`}
            title={spritesLoaded ? "Toggle custom sprites" : "Add sprites to /public/sprites/"}
          >
            <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className={`p-2 sm:p-2.5 md:p-3 rounded-full transition-all ${showDebug ? "bg-yellow-500/70 text-black" : "bg-black/50 hover:bg-black/70 text-white/70 hover:text-white"}`}
            title="Toggle debug info"
          >
            <Bug className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        </div>
      )}

      {!transparentMode && spriteError && showControls && (
        <div
          className="absolute top-10 left-2 right-2 bg-orange-500/90 text-white text-xs p-2 rounded"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {spriteError}
        </div>
      )}

      {/* Debug panel - hidden in transparent mode */}
      {!transparentMode && showDebug && isListening && (
        <DebugPanel
          audioData={audioData}
          spriteError={spriteError}
          showControls={showControls}
          spritesLoaded={spritesLoaded}
          hasFrameSprites={hasFrameSprites}
          expanded={debugExpanded}
          onToggleExpanded={() => setDebugExpanded(!debugExpanded)}
        />
      )}

      {/* Character */}
      <div className={`w-full h-full flex items-center justify-center ${showDebug && isListening ? "pt-40" : "pt-4"}`}>
        <DesktopBuddy
          audioData={audioData}
          isActive={isListening}
          useCustomSprites={useCustomSprites && spritesLoaded}
          hasFrameSprites={hasFrameSprites}
          moodLock={moodLock}
          transparentMode={transparentMode}
        />
      </div>

      {/* Start/Stop button - hidden in transparent mode */}
      {!transparentMode && (
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-opacity ${showControls || !isListening ? "opacity-100" : "opacity-0"}`}
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <button
            onClick={() => (isListening ? stopCapture() : startCapture())}
            className={`px-5 py-1.5 sm:px-7 sm:py-2 md:px-9 md:py-2.5 rounded-full text-base sm:text-lg font-medium transition-all ${isListening
              ? "bg-red-500/80 hover:bg-red-500 text-white"
              : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
              }`}
          >
            {isListening ? "Stop" : "Start Vibing"}
          </button>
        </div>
      )}

      {!transparentMode && error && (
        <div className="absolute bottom-16 left-2 right-2 bg-red-500/80 text-white text-xs p-2 rounded">{error}</div>
      )}

      {/* Waveform positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none">
        <Waveform frequencyData={audioData.frequencyData || []} isActive={isListening && audioData.isActive} />
      </div>
    </div>
  )
}