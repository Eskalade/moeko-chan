import { useEffect } from "react"

export function useElectronTransparent() {
	useEffect(() => {
		document.documentElement.classList.add("electron-transparent")
		return () => {
			document.documentElement.classList.remove("electron-transparent")
		}
	}, [])
}
