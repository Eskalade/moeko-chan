import { useState, useEffect } from "react"
import {
	SPRITE_FRAMES,
	MOOD_SPRITES
} from "@/components/desktop/sprite-constants"

export function useSpriteLoader() {
	const [spritesLoaded, setSpritesLoaded] = useState(false)
	const [hasFrameSprites, setHasFrameSprites] = useState(false)
	const [spriteError, setSpriteError] = useState<string | null>(null)

	useEffect(() => {
		const checkSprites = async () => {
			// Check single sprites
			try {
				const response = await fetch(MOOD_SPRITES.chill, { method: "HEAD" })
				if (response.ok) {
					setSpritesLoaded(true)
					setSpriteError(null)
				} else {
					throw new Error("Single sprites not found")
				}
			} catch {
				setSpritesLoaded(false)
				setSpriteError(
					"Add sprites to /public/sprites/ (chill.png, happy.png, sad.png, energetic.png)"
				)
			}

			// Check frame sprites
			try {
				const response = await fetch(SPRITE_FRAMES.chill[0], { method: "HEAD" })
				if (response.ok) {
					setHasFrameSprites(true)
				}
			} catch {
				setHasFrameSprites(false)
			}
		}
		checkSprites()
	}, [])

	return { spritesLoaded, hasFrameSprites, spriteError }
}
