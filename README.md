# Vibe Buddy

A cute desktop AI companion that reacts to your music in real-time. Vibe Buddy analyzes audio from your microphone or system audio to detect BPM, genre, mood, and energy levels, then displays an animated character that dances and emotes along with your tunes.

## Features

- **Real-time Audio Analysis** - Captures and analyzes audio from microphone or system audio
- **BPM Detection** - Detects beats per minute (50-200 BPM range) using beat detection algorithms
- **Genre Classification** - Identifies music genre (electronic, hip-hop, rock, pop, jazz, classical, ambient, metal, r&b, reggae)
- **Mood Detection** - Classifies audio mood as chill, energetic, happy, or sad
- **Frequency Spectrum Analysis** - Monitors bass (0-250Hz), mid (250-2000Hz), and treble levels
- **Animated Character** - Bouncy sprite with physics-based animations that react to the beat
- **Desktop Widget** - Floating, always-on-top transparent window (300x350px)
- **Tray Menu** - System tray icon with quick controls
- **Global Shortcut** - Toggle visibility with `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac)
- **Custom Sprites** - Use your own character images
- **Web App Mode** - Also works in the browser with a character generator

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd cuteanimedesktopcompanion

# Install dependencies
npm install
```

## Usage

### Desktop Mode (Electron)

Run the app as a floating desktop companion:

```bash
npm run electron-dev
```

This starts both the Next.js dev server and the Electron app. The companion will appear in the bottom-right corner of your screen.

### Web Mode

Run as a web application:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Controls

| Control | Action |
|---------|--------|
| `Ctrl/Cmd + Shift + V` | Toggle companion visibility |
| Tray Icon > Toggle Click-Through | Make window click-through |
| Tray Icon > Reset Position | Move back to default position |
| Drag window | Reposition the companion |

## Audio Metrics

Vibe Buddy analyzes the following metrics in real-time:

| Metric | Description | Range |
|--------|-------------|-------|
| **BPM** | Beats per minute | 50-200 |
| **Energy** | Overall loudness level | 0-100% |
| **Bass Level** | Low frequency energy (0-250Hz) | 0-100% |
| **Mid Level** | Mid frequency energy (250-2000Hz) | 0-100% |
| **Treble Level** | High frequency energy (2000Hz+) | 0-100% |
| **Genre** | Detected music genre | See list above |
| **Mood** | Emotional classification | chill, energetic, happy, sad |
| **Danceability** | How danceable the track is | 0-100% |
| **Valence** | Musical positivity | 0-100% |

## Project Structure

```
├── app/
│   ├── desktop/page.tsx     # Desktop companion UI
│   ├── popout/page.tsx      # Popout window UI
│   └── page.tsx             # Main web interface
├── components/
│   ├── music-companion.tsx  # Main web interface component
│   ├── pngtuber.tsx         # Character rendering with physics
│   ├── character-generator.tsx
│   ├── audio-visualizer.tsx
│   └── particles.tsx
├── electron/
│   └── main.js              # Electron app setup
├── hooks/
│   └── use-audio-capture.ts # Core audio analysis hook
├── lib/
│   └── audio-ml.ts          # ML heuristics for genre/mood
└── public/
    └── sprites/             # Character sprite images
        ├── chill.png
        ├── energetic.png
        ├── happy.png
        └── sad.png
```

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16
- **Desktop**: [Electron](https://www.electronjs.org/) 33
- **UI**: [Tailwind CSS](https://tailwindcss.com/) 4, [Radix UI](https://www.radix-ui.com/)
- **Audio**: Web Audio API, [realtime-bpm-analyzer](https://www.npmjs.com/package/realtime-bpm-analyzer)
- **Language**: TypeScript

## Customization

### Custom Sprites

Replace the sprite images in `public/sprites/` with your own:

- `chill.png` - Displayed when mood is "chill"
- `energetic.png` - Displayed when mood is "energetic"
- `happy.png` - Displayed when mood is "happy"
- `sad.png` - Displayed when mood is "sad"

Recommended size: 200x200px with transparent background.

### Tray Icon

Replace `electron/icon.png` with your own tray icon.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production |
| `npm run electron-dev` | Run Electron with Next.js dev server |
| `npm run electron` | Run Electron (requires built app) |
| `npm run lint` | Run ESLint |