import { useEffect, useCallback } from "react"

interface KeyboardShortcutsProps {
	onToggleDebug: () => void
	onToggleDebugExpanded: () => void
	onToggleTransparent: () => void
}

export function useKeyboardShortcuts({
	onToggleDebug,
	onToggleDebugExpanded,
	onToggleTransparent
}: KeyboardShortcutsProps) {
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.ctrlKey && e.shiftKey && e.key === "D") {
				onToggleDebug()
				e.preventDefault()
			}
			if (e.ctrlKey && e.shiftKey && e.key === "E") {
				onToggleDebugExpanded()
				e.preventDefault()
			}
			if (e.ctrlKey && e.shiftKey && e.key === "T") {
				onToggleTransparent()
				e.preventDefault()
			}
		},
		[onToggleDebug, onToggleDebugExpanded, onToggleTransparent]
	)

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [handleKeyDown])
}
