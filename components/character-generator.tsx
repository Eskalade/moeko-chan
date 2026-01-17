"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Loader2, X } from "lucide-react"

interface CharacterGeneratorProps {
  onCharacterGenerated: (imageUrl: string) => void
  onClose: () => void
}

export function CharacterGenerator({ onCharacterGenerated, onClose }: CharacterGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const presets = [
    { label: "Cat", prompt: "a cute cat with headphones" },
    { label: "Robot", prompt: "a friendly robot DJ with LED eyes" },
    { label: "Ghost", prompt: "a cute floating ghost with a happy face" },
    { label: "Slime", prompt: "a bouncy slime creature that loves music" },
    { label: "Alien", prompt: "a small alien with antenna that glow to music" },
    { label: "Panda", prompt: "a chill panda wearing sunglasses" },
  ]

  const handleGenerate = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt
    if (!finalPrompt.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }),
      })

      const data = await response.json()

      if (data.success && data.images?.length > 0) {
        const imageUrl = `data:${data.images[0].mediaType};base64,${data.images[0].base64}`
        setPreviewImage(imageUrl)
      } else {
        setError(data.error || "Failed to generate character")
      }
    } catch (err) {
      setError("Failed to connect to AI service")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUseCharacter = () => {
    if (previewImage) {
      onCharacterGenerated(previewImage)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            AI Character Generator
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-muted-foreground text-sm mb-4">Describe your ideal vibe buddy or pick a preset</p>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => handleGenerate(preset.prompt)}
              disabled={isGenerating}
              className="text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Custom prompt */}
        <div className="flex gap-2 mb-4">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A cute dragon with DJ headphones..."
            disabled={isGenerating}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <Button onClick={() => handleGenerate()} disabled={isGenerating || !prompt.trim()}>
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
          </Button>
        </div>

        {error && <p className="text-destructive text-sm mb-4">{error}</p>}

        {/* Preview */}
        {previewImage && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 flex items-center justify-center">
              <img
                src={previewImage || "/placeholder.svg"}
                alt="Generated character"
                className="max-w-full max-h-64 object-contain rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleGenerate(prompt)}
                disabled={isGenerating}
                className="flex-1"
              >
                Regenerate
              </Button>
              <Button onClick={handleUseCharacter} className="flex-1 bg-emerald-600 hover:bg-emerald-500">
                Use This Character
              </Button>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Creating your vibe buddy...</p>
          </div>
        )}
      </div>
    </div>
  )
}
