import type { Mood } from "@/hooks/use-audio-capture"

export const SPRITE_FRAMES: Record<Mood, string[]> = {
	chill: [
		"/sprites/chill-1.png",
		"/sprites/chill-2.png",
		"/sprites/chill-3.png",
		"/sprites/chill-4.png"
	],
	happy: [
		"/sprites/happy-1.png",
		"/sprites/happy-2.png",
		"/sprites/happy-3.png",
		"/sprites/happy-4.png"
	],
	sad: [
		"/sprites/sad-1.png",
		"/sprites/sad-2.png",
		"/sprites/sad-3.png",
		"/sprites/sad-4.png"
	],
	energetic: [
		"/sprites/energetic-1.png",
		"/sprites/energetic-2.png",
		"/sprites/energetic-3.png",
		"/sprites/energetic-4.png"
	],
	sleep: [
		"/sprites/sleep-1.png",
		"/sprites/sleep-2.png",
		"/sprites/sleep-3.png",
		"/sprites/sleep-4.png"
	]
}

export const MOOD_SPRITES: Record<Mood, string> = {
	chill: "/sprites/chill.png",
	happy: "/sprites/happy.png",
	sad: "/sprites/sad.png",
	energetic: "/sprites/energetic.png",
	sleep: "/sprites/sleep-1.png"
}

export const FRAME_SPEEDS: Record<Mood, number> = {
	chill: 800,
	happy: 200,
	sad: 1200,
	energetic: 100,
	sleep: 1800
}

export const GLOW_COLORS: Record<Mood, string> = {
	chill: "rgba(34, 211, 238, 0.5)",
	happy: "rgba(250, 204, 21, 0.5)",
	sad: "rgba(129, 140, 248, 0.4)",
	energetic: "rgba(251, 146, 60, 0.6)",
	sleep: "rgba(147, 112, 219, 0.3)"
}
