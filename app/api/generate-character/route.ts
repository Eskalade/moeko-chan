import { generateText } from "ai"

export async function POST(req: Request) {
  const { prompt } = await req.json()

  try {
    const result = await generateText({
      model: "google/gemini-3-pro-image-preview",
      prompt: `Create a cute, round, blob-like character design for a music companion app. The character should be:
- Simple and kawaii style
- A single round character with a face
- Suitable as a PNG tuber / vtuber avatar
- ${prompt}

Make it colorful, friendly, and expressive. The character should look like it would enjoy listening to music. Generate a single character portrait on a transparent or simple background.`,
    })

    const images = []
    for (const file of result.files) {
      if (file.mediaType.startsWith("image/")) {
        images.push({
          base64: file.base64,
          mediaType: file.mediaType,
        })
      }
    }

    return Response.json({
      text: result.text,
      images,
      success: true,
    })
  } catch (error) {
    console.error("Image generation error:", error)
    return Response.json({ error: "Failed to generate character", success: false }, { status: 500 })
  }
}
