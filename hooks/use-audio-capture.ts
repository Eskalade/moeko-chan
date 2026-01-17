"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { createRealTimeBpmProcessor } from "realtime-bpm-analyzer"
import { analyzeAudioFeatures, getSmoothedPrediction, resetPredictionHistory } from "@/lib/audio-ml"

export type AudioMode = "system" | "microphone"
export type Mood = "chill" | "energetic" | "sad" | "happy"

export interface AudioData {
  bpm: number
  energy: number
  bassLevel: number
  midLevel: number
  trebleLevel: number
  mood: Mood
  genre: string
  isActive: boolean
  danceability: number
  valence: number
  genreConfidence: number
  moodConfidence: number
  beat: boolean
}

const defaultAudioData: AudioData = {
  bpm: 0,
  energy: 0,
  bassLevel: 0,
  midLevel: 0,
  trebleLevel: 0,
  mood: "chill", // Default mood is chill
  genre: "Unknown",
  isActive: false,
  danceability: 0,
  valence: 0,
  genreConfidence: 0,
  moodConfidence: 0,
  beat: false,
}

export function useAudioCapture(mode: AudioMode = "mic") {
  const [isListening, setIsListening] = useState(false)
  const [audioData, setAudioData] = useState<AudioData>(defaultAudioData)
  const [error, setError] = useState<string | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const bpmProcessorRef = useRef<AudioWorkletNode | null>(null)
  const currentBpmRef = useRef<number>(0)
  const beatTimesRef = useRef<number[]>([])
  const lastBeatTimeRef = useRef<number>(0)
  const energyHistoryRef = useRef<number[]>([])

  const silenceCountRef = useRef<number>(0)
  const lastActiveTimeRef = useRef<number>(Date.now())
  const beatRef = useRef<boolean>(false)

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (bpmProcessorRef.current) {
      try {
        bpmProcessorRef.current.disconnect()
      } catch {
        // Ignore cleanup errors
      }
      bpmProcessorRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null
    currentBpmRef.current = 0
    beatTimesRef.current = []
    lastBeatTimeRef.current = 0
    energyHistoryRef.current = []
    silenceCountRef.current = 0
    resetPredictionHistory()
    setAudioData(defaultAudioData)
  }, [])

  const analyze = useCallback(() => {
    if (!analyserRef.current) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)

    const sampleRate = audioContextRef.current?.sampleRate || 44100
    const nyquist = sampleRate / 2
    const binSize = nyquist / bufferLength

    const bassEndBin = Math.min(Math.floor(250 / binSize), bufferLength)
    const midEndBin = Math.min(Math.floor(2000 / binSize), bufferLength)

    let bassSum = 0,
      midSum = 0,
      trebleSum = 0,
      totalSum = 0

    for (let i = 0; i < bassEndBin; i++) {
      bassSum += dataArray[i]
      totalSum += dataArray[i]
    }
    for (let i = bassEndBin; i < midEndBin; i++) {
      midSum += dataArray[i]
      totalSum += dataArray[i]
    }
    for (let i = midEndBin; i < bufferLength; i++) {
      trebleSum += dataArray[i]
      totalSum += dataArray[i]
    }

    const bassLevel = Math.min(1, (bassSum / (bassEndBin * 255)) * 4)
    const midLevel = Math.min(1, (midSum / ((midEndBin - bassEndBin) * 255)) * 4)
    const trebleLevel = Math.min(1, (trebleSum / ((bufferLength - midEndBin) * 255)) * 4)
    const energy = Math.min(1, (totalSum / (bufferLength * 255)) * 3)

    const isSilent = energy < 0.05
    if (isSilent) {
      silenceCountRef.current++
    } else {
      silenceCountRef.current = 0
      lastActiveTimeRef.current = Date.now()
    }

    const isInSilence = silenceCountRef.current > 120

    const now = performance.now()
    energyHistoryRef.current.push(bassLevel)
    if (energyHistoryRef.current.length > 50) {
      energyHistoryRef.current.shift()
    }

    const avgEnergy = energyHistoryRef.current.reduce((a, b) => a + b, 0) / energyHistoryRef.current.length
    const threshold = avgEnergy * 1.3

    let isBeat = false
    if (bassLevel > threshold && now - lastBeatTimeRef.current > 200) {
      beatTimesRef.current.push(now)
      lastBeatTimeRef.current = now
      isBeat = true

      if (beatTimesRef.current.length > 20) {
        beatTimesRef.current.shift()
      }

      if (beatTimesRef.current.length >= 4) {
        const intervals: number[] = []
        for (let i = 1; i < beatTimesRef.current.length; i++) {
          intervals.push(beatTimesRef.current[i] - beatTimesRef.current[i - 1])
        }

        intervals.sort((a, b) => a - b)
        const medianInterval = intervals[Math.floor(intervals.length / 2)]

        if (medianInterval > 0) {
          const calculatedBpm = Math.round(60000 / medianInterval)
          if (calculatedBpm >= 50 && calculatedBpm <= 200) {
            if (currentBpmRef.current === 0) {
              currentBpmRef.current = calculatedBpm
            } else {
              currentBpmRef.current = Math.round(currentBpmRef.current * 0.8 + calculatedBpm * 0.2)
            }
          }
        }
      }
    }

    beatRef.current = isBeat
    if (isBeat) {
      setTimeout(() => {
        beatRef.current = false
      }, 100)
    }

    if (isInSilence) {
      setAudioData({
        ...defaultAudioData,
        isActive: false,
        mood: "chill",
        beat: false,
      })
    } else {
      const bpm = currentBpmRef.current || 100
      const mlResult = analyzeAudioFeatures(dataArray, bpm)
      const smoothedResult = getSmoothedPrediction(mlResult)

      setAudioData({
        bpm: currentBpmRef.current || 0,
        energy,
        bassLevel,
        midLevel,
        trebleLevel,
        mood: smoothedResult.mood,
        genre: smoothedResult.genre,
        isActive: energy > 0.02,
        danceability: smoothedResult.danceability,
        valence: smoothedResult.valence,
        genreConfidence: smoothedResult.genreConfidence,
        moodConfidence: smoothedResult.moodConfidence,
        beat: isBeat,
      })
    }

    animationFrameRef.current = requestAnimationFrame(analyze)
  }, [])

  const startCapture = useCallback(async () => {
    setError(null)
    cleanup()
    resetPredictionHistory()

    try {
      let stream: MediaStream

      if (mode === "system") {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        })

        const audioTracks = stream.getAudioTracks()
        if (audioTracks.length === 0) {
          stream.getTracks().forEach((t) => t.stop())
          throw new Error("No audio track - make sure to check 'Share tab audio'")
        }

        stream.getVideoTracks().forEach((track) => track.stop())
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        })
      }

      streamRef.current = stream

      const audioContext = new AudioContext()
      if (audioContext.state === "suspended") await audioContext.resume()
      audioContextRef.current = audioContext

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 4096
      analyser.smoothingTimeConstant = 0.8
      analyserRef.current = analyser

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      try {
        const realtimeBpmProcessor = await createRealTimeBpmProcessor(audioContext, {
          continuousAnalysis: true,
          stabilizationTime: 10_000,
        })

        bpmProcessorRef.current = realtimeBpmProcessor

        source.connect(realtimeBpmProcessor)

        realtimeBpmProcessor.port.onmessage = (event) => {
          if (event.data?.result?.bpm?.length > 0) {
            const topCandidate = event.data.result.bpm[0]
            if (topCandidate?.tempo) {
              currentBpmRef.current = Math.round(topCandidate.tempo)
            }
          }
        }
      } catch (bpmErr) {
        console.warn("[v0] realtime-bpm-analyzer setup failed, using custom beat detection:", bpmErr)
      }

      setIsListening(true)
      analyze()
    } catch (err) {
      console.error("[v0] Capture error:", err)
      setError(err instanceof Error ? err.message : "Failed to capture audio")
      cleanup()
    }
  }, [mode, analyze, cleanup])

  const stopCapture = useCallback(() => {
    cleanup()
    setIsListening(false)
  }, [cleanup])

  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  return {
    isListening,
    audioData,
    error,
    startCapture,
    stopCapture,
  }
}
