"use client"

import {
  logClassification,
  logSmoothing,
  updateDebugState,
  type ClassificationDebugInfo,
} from "@/lib/audio-debug"

export interface AudioMLResult {
  genre: string
  genreConfidence: number
  mood: "chill" | "energetic" | "sad" | "happy"
  moodConfidence: number
  danceability: number
  energy: number
  valence: number
}

// Store genre scores for confidence calculation
let lastGenreScores: Record<string, number> = {}
let lastMoodScores: Record<string, number> = {}

export function analyzeAudioFeatures(frequencyData: Uint8Array, bpm: number, sampleRate: number = 44100): AudioMLResult {
  const bufferLength = frequencyData.length

  let bassEnergy = 0
  let midEnergy = 0
  let highEnergy = 0
  let totalEnergy = 0

  // Use proper frequency-based bins matching use-audio-capture.ts (250Hz/2000Hz cutoffs)
  const nyquist = sampleRate / 2
  const binSize = nyquist / bufferLength
  const bassEnd = Math.min(Math.floor(250 / binSize), bufferLength)
  const midEnd = Math.min(Math.floor(2000 / binSize), bufferLength)

  for (let i = 0; i < bufferLength; i++) {
    const value = frequencyData[i] / 255
    totalEnergy += value

    if (i < bassEnd) {
      bassEnergy += value
    } else if (i < midEnd) {
      midEnergy += value
    } else {
      highEnergy += value
    }
  }

  bassEnergy /= bassEnd || 1
  midEnergy /= (midEnd - bassEnd) || 1
  highEnergy /= (bufferLength - midEnd) || 1
  totalEnergy /= bufferLength

  let weightedSum = 0
  let sum = 0
  for (let i = 0; i < bufferLength; i++) {
    weightedSum += i * frequencyData[i]
    sum += frequencyData[i]
  }
  // Fixed: removed extra / bufferLength division that was incorrectly normalizing
  // Normalize by dividing weighted average bin index by bufferLength once
  const spectralCentroid = sum > 0 ? (weightedSum / sum) / bufferLength : 0.5

  let logSum = 0
  let arithmeticSum = 0
  let validCount = 0
  for (let i = 0; i < bufferLength; i++) {
    const value = frequencyData[i] + 1
    logSum += Math.log(value)
    arithmeticSum += value
    validCount++
  }
  const geometricMean = Math.exp(logSum / validCount)
  const arithmeticMean = arithmeticSum / validCount
  const spectralFlatness = arithmeticMean > 0 ? geometricMean / arithmeticMean : 0

  const { genre, scores: genreScores } = detectGenreWithScores(bassEnergy, midEnergy, highEnergy, spectralCentroid, spectralFlatness, bpm)
  lastGenreScores = genreScores

  const energy = Math.min(1, totalEnergy * 2)
  // Improved valence calculation: combine brightness with harmonic content
  const valence = spectralCentroid * 0.5 + (1 - bassEnergy) * 0.3 + midEnergy * 0.2
  const danceability = calculateDanceability(bpm, bassEnergy, energy)

  // Fixed mood logic:
  // - "happy": high energy + high valence (bright, upbeat)
  // - "energetic": high energy + low/mid valence (intense but not necessarily bright)
  // - "chill": low energy + high valence (relaxed, pleasant)
  // - "sad": low energy + low valence (slow, dark)
  const moodScores = {
    happy: (energy * 0.5 + valence * 0.5),
    energetic: (energy * 0.7 + (1 - valence) * 0.3),
    chill: ((1 - energy) * 0.5 + valence * 0.5),
    sad: ((1 - energy) * 0.5 + (1 - valence) * 0.5),
  }
  lastMoodScores = moodScores

  // Pick mood with highest score
  let mood: "chill" | "energetic" | "sad" | "happy" = "chill"
  let maxMoodScore = 0
  for (const [m, score] of Object.entries(moodScores)) {
    if (score > maxMoodScore) {
      maxMoodScore = score
      mood = m as typeof mood
    }
  }

  // Calculate real confidence based on score margins (not random!)
  const sortedGenreScores = Object.values(genreScores).sort((a, b) => b - a)
  const genreConfidence = sortedGenreScores.length > 1
    ? Math.min(1, (sortedGenreScores[0] - sortedGenreScores[1]) / (sortedGenreScores[0] + 0.1) + 0.5)
    : 0.7

  const sortedMoodScores = Object.values(moodScores).sort((a, b) => b - a)
  const moodConfidence = sortedMoodScores.length > 1
    ? Math.min(1, (sortedMoodScores[0] - sortedMoodScores[1]) / 0.5 + 0.5)
    : 0.7

  // Log classification for debugging
  const classificationInfo: ClassificationDebugInfo = {
    genre,
    genreScores,
    mood,
    moodScores,
    spectralCentroid,
    spectralFlatness,
    bassEnergy,
    midEnergy,
    highEnergy,
  }
  logClassification(classificationInfo)
  updateDebugState("classificationInfo", classificationInfo)

  return {
    genre,
    genreConfidence,
    mood,
    moodConfidence,
    danceability,
    energy,
    valence,
  }
}

function detectGenreWithScores(
  bass: number,
  mid: number,
  high: number,
  brightness: number,
  flatness: number,
  bpm: number,
): { genre: string; scores: Record<string, number> } {
  const scores: Record<string, number> = {
    electronic: 0,
    "hip-hop": 0,
    rock: 0,
    metal: 0,
    pop: 0,
    jazz: 0,
    classical: 0,
    reggae: 0,
    rnb: 0,
    indie: 0,
  }

  const bassRatio = bass / (mid + 0.001)

  // BPM-based scoring
  if (bpm >= 120 && bpm <= 140) {
    scores.electronic += 3
    scores.pop += 2
  }
  if (bpm >= 85 && bpm <= 115) {
    scores["hip-hop"] += 2
    scores.rnb += 2
  }
  if (bpm >= 100 && bpm <= 130) {
    scores.rock += 2
    scores.indie += 2
  }
  if (bpm >= 140) {
    scores.metal += 3
    scores.electronic += 1
  }
  if (bpm >= 60 && bpm <= 90) {
    scores.reggae += 2
    scores.jazz += 1
    scores.classical += 1
  }
  if (bpm >= 70 && bpm <= 120) {
    scores.jazz += 2
  }

  // Bass characteristics
  if (bass > 0.5) {
    scores["hip-hop"] += 2
    scores.electronic += 2
    scores.reggae += 1
  }
  if (bassRatio > 1.5) {
    scores["hip-hop"] += 2
    scores.rnb += 1
  }
  if (bass < 0.3) {
    scores.classical += 2
    scores.jazz += 1
    scores.indie += 1
  }

  // Mid frequencies
  if (mid > 0.5) {
    scores.rock += 2
    scores.pop += 2
    scores.indie += 1
  }
  if (mid > bass && mid > high) {
    scores.pop += 2
    scores.indie += 2
    scores.jazz += 1
  }

  // High frequencies
  if (brightness > 0.6) {
    scores.electronic += 2
    scores.pop += 1
    scores.metal += 1
  }
  if (brightness < 0.35) {
    scores.reggae += 2
    scores["hip-hop"] += 1
    scores.jazz += 1
  }

  // Spectral flatness
  if (flatness > 0.4) {
    scores.metal += 3
    scores.rock += 2
    scores.electronic += 1
  }
  if (flatness < 0.2) {
    scores.classical += 3
    scores.jazz += 2
    scores.rnb += 1
  }

  // High energy combinations
  if (flatness > 0.35 && mid > 0.4 && bpm >= 110) {
    scores.rock += 2
  }
  if (bass > 0.4 && high > 0.3 && flatness > 0.3) {
    scores.electronic += 2
  }

  let maxScore = 0
  let detectedGenre = "pop"

  for (const [genre, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      detectedGenre = genre
    }
  }

  return { genre: detectedGenre, scores }
}

function calculateDanceability(bpm: number, bass: number, energy: number): number {
  const bpmScore = 1 - Math.abs(bpm - 120) / 80
  const bassScore = bass
  const energyScore = energy

  return Math.min(1, Math.max(0, bpmScore * 0.4 + bassScore * 0.3 + energyScore * 0.3))
}

const predictionHistory: AudioMLResult[] = []
const HISTORY_SIZE = 60

export function getSmoothedPrediction(result: AudioMLResult): AudioMLResult {
  predictionHistory.push(result)
  if (predictionHistory.length > HISTORY_SIZE) {
    predictionHistory.shift()
  }

  const genreCounts: Record<string, number> = {}
  const moodCounts: Record<string, number> = {}
  let totalEnergy = 0
  let totalValence = 0
  let totalDanceability = 0

  for (const pred of predictionHistory) {
    genreCounts[pred.genre] = (genreCounts[pred.genre] || 0) + 1
    moodCounts[pred.mood] = (moodCounts[pred.mood] || 0) + 1
    totalEnergy += pred.energy
    totalValence += pred.valence
    totalDanceability += pred.danceability
  }

  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])
  const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])

  const len = predictionHistory.length

  const topMood = sortedMoods[0]
  const topMoodCount = topMood?.[1] || 0
  // Lowered threshold from 40% to 25% to be more responsive to mood changes
  const moodThreshold = len * 0.25

  let finalMood: AudioMLResult["mood"] = "chill"
  if (topMoodCount >= moodThreshold) {
    finalMood = topMood[0] as AudioMLResult["mood"]
  }

  // Log smoothing info for debugging
  logSmoothing(len, genreCounts, moodCounts, sortedGenres[0]?.[0] || result.genre, finalMood)

  return {
    genre: sortedGenres[0]?.[0] || result.genre,
    genreConfidence: (sortedGenres[0]?.[1] || 0) / len,
    mood: finalMood,
    moodConfidence: (sortedMoods[0]?.[1] || 0) / len,
    energy: totalEnergy / len,
    valence: totalValence / len,
    danceability: totalDanceability / len,
  }
}

export function resetPredictionHistory() {
  predictionHistory.length = 0
}
