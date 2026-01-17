"use client"

export interface AudioMetrics {
  energy: number
  bassLevel: number
  midLevel: number
  trebleLevel: number
  isActive: boolean
  isSilent: boolean
  silenceCount: number
}

export interface BpmDebugInfo {
  currentBpm: number
  realtimeBpm: number
  beatCount: number
  lastInterval: number
  threshold: number
  avgEnergy: number
}

export interface ClassificationDebugInfo {
  genre: string
  genreScores: Record<string, number>
  mood: string
  moodScores: Record<string, number>
  spectralCentroid: number
  spectralFlatness: number
  bassEnergy: number
  midEnergy: number
  highEnergy: number
}

// Check if debug mode is enabled
export function isDebugEnabled(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("VIBE_DEBUG") === "true"
}

// Frame counter for throttled logging
let frameCount = 0
const LOG_INTERVAL = 60 // Log every 60 frames (~1 second at 60fps)

export function logAudioMetrics(metrics: AudioMetrics): void {
  if (!isDebugEnabled()) return

  frameCount++
  if (frameCount % LOG_INTERVAL !== 0) return

  console.log(
    `[Audio] energy=${metrics.energy.toFixed(3)} bass=${metrics.bassLevel.toFixed(3)} ` +
    `mid=${metrics.midLevel.toFixed(3)} treble=${metrics.trebleLevel.toFixed(3)} ` +
    `active=${metrics.isActive} silent=${metrics.isSilent} silenceFrames=${metrics.silenceCount}`
  )
}

export function logBpmDetection(info: BpmDebugInfo): void {
  if (!isDebugEnabled()) return

  // Only log on significant changes
  console.log(
    `[BPM] current=${info.currentBpm} realtime=${info.realtimeBpm} ` +
    `beats=${info.beatCount} interval=${info.lastInterval.toFixed(0)}ms ` +
    `threshold=${info.threshold.toFixed(3)} avgEnergy=${info.avgEnergy.toFixed(3)}`
  )
}

export function logBeat(bassLevel: number, threshold: number, bpm: number): void {
  if (!isDebugEnabled()) return
  console.log(`[Beat] bass=${bassLevel.toFixed(3)} threshold=${threshold.toFixed(3)} bpm=${bpm}`)
}

export function logClassification(info: ClassificationDebugInfo): void {
  if (!isDebugEnabled()) return

  frameCount++
  if (frameCount % LOG_INTERVAL !== 0) return

  // Sort genre scores
  const sortedGenres = Object.entries(info.genreScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g, s]) => `${g}:${s.toFixed(1)}`)
    .join(" ")

  // Sort mood scores
  const sortedMoods = Object.entries(info.moodScores)
    .sort((a, b) => b[1] - a[1])
    .map(([m, s]) => `${m}:${s.toFixed(2)}`)
    .join(" ")

  console.log(
    `[ML] genre=${info.genre} (${sortedGenres}) | mood=${info.mood} (${sortedMoods})\n` +
    `     centroid=${info.spectralCentroid.toFixed(3)} flatness=${info.spectralFlatness.toFixed(3)} ` +
    `bass=${info.bassEnergy.toFixed(3)} mid=${info.midEnergy.toFixed(3)} high=${info.highEnergy.toFixed(3)}`
  )
}

export function logSmoothing(
  historyLength: number,
  genreCounts: Record<string, number>,
  moodCounts: Record<string, number>,
  finalGenre: string,
  finalMood: string
): void {
  if (!isDebugEnabled()) return

  frameCount++
  if (frameCount % LOG_INTERVAL !== 0) return

  const genreStr = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g, c]) => `${g}:${c}`)
    .join(" ")

  const moodStr = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([m, c]) => `${m}:${c}`)
    .join(" ")

  console.log(
    `[Smooth] history=${historyLength} | genres: ${genreStr} -> ${finalGenre} | moods: ${moodStr} -> ${finalMood}`
  )
}

export function logBpmReset(reason: string, preservedBpm: number): void {
  if (!isDebugEnabled()) return
  console.log(`[BPM Reset] reason="${reason}" preservedBpm=${preservedBpm}`)
}

export function logRealtimeBpmUpdate(tempo: number, count: number): void {
  if (!isDebugEnabled()) return
  console.log(`[Realtime BPM] tempo=${tempo} candidates=${count}`)
}

// Debug state store for UI panel
let debugState: {
  audioMetrics: AudioMetrics | null
  bpmInfo: BpmDebugInfo | null
  classificationInfo: ClassificationDebugInfo | null
} = {
  audioMetrics: null,
  bpmInfo: null,
  classificationInfo: null,
}

export function updateDebugState(
  key: "audioMetrics" | "bpmInfo" | "classificationInfo",
  value: AudioMetrics | BpmDebugInfo | ClassificationDebugInfo
): void {
  debugState[key] = value as any
}

export function getDebugState() {
  return debugState
}

export function resetDebugState(): void {
  debugState = {
    audioMetrics: null,
    bpmInfo: null,
    classificationInfo: null,
  }
  frameCount = 0
}
