# 🌐 Subtitle Translate Web

AI-powered subtitle & data file translation web application. Translate subtitles using **Google Gemini** or **OpenRouter** (100+ models) with real-time streaming, batch processing, and a beautiful modern UI.

## ✨ Features

- **Multi-format support** — SRT, VTT, ASS/SSA, JSON, XML
- **Multiple AI providers** — Google Gemini, OpenRouter, or any custom OpenAI-compatible endpoint
- **Real-time streaming** — See translations appear line-by-line as they're processed
- **Guest mode** — Try it free with the built-in Gemma 3 27B model (rate-limited)
- **Streaming REST API** — Programmatic access via `/api/v1/translate` (NDJSON streaming)
- **Video preview** — Load a video file and preview translated subtitles in sync
- **Bilingual export** — Export original + translated text side by side
- **Multiple export formats** — Download in SRT, VTT, ASS, or original format
- **Dark / Light theme** — Automatic and manual theme switching
- **Internationalization (i18n)** — Multi-language UI (Vietnamese, English, …)
- **Responsive design** — Fully optimized for desktop and mobile
- **Advanced settings** — Custom context, style prompts, and batch size control

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| UI | [React 19](https://react.dev), [Ant Design 6](https://ant.design) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| AI | [Google Generative AI SDK](https://ai.google.dev), [OpenRouter API](https://openrouter.ai) |
| Rate Limiting | [Upstash Redis](https://upstash.com) |
| Language | TypeScript 5 |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm**, **yarn**, or **pnpm**

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd subtitle-translate-web-v2

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Required for guest mode (server-side AI keys)
GEMINI_API_KEY=your-gemini-api-key
OPENROUTER_API_KEY=your-openrouter-api-key

# Optional: Rate limiting via Upstash Redis (for guest mode)
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
DAILY_QUOTA=5  # Daily translation limit per IP for guest mode
```

> **Note:** Users can bring their own API keys in the UI — the server-side keys above are only needed for guest mode.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Production Build

```bash
npm run build
npm start
```

## 📡 REST API

The app exposes a streaming translation API for programmatic use.

### `GET /api/v1/models`

Returns available AI models for Google Gemini and OpenRouter.

### `POST /api/v1/translate`

Translates a subtitle/data file with streaming NDJSON response.

**Request** (`multipart/form-data`):

| Parameter | Type | Required | Description |
|---|---|---|---|
| `file` | File | ✅ | Subtitle file (.srt, .vtt, .ass, .json, .xml) |
| `apiKey` | string | ✅ | Your AI provider API key |
| `provider` | string | ✅ | `google`, `openrouter`, or `custom` |
| `model` | string | ✅ | Model ID (e.g. `gemini-2.0-flash`) |
| `targetLanguage` | string | ✅ | Target language code (e.g. `vi`, `en`, `ja`) |
| `context` | string | | Additional context for the translator |
| `style` | string | | Translation style instructions |
| `batchSize` | string | | Lines per batch (default: 50, max: 100) |
| `customEndpoint` | string | | Required for `custom` provider |

**Example:**

```bash
curl -X POST \
  http://localhost:3000/api/v1/translate \
  -F "file=@subtitle.srt" \
  -F "apiKey=your-api-key" \
  -F "provider=google" \
  -F "model=gemini-2.0-flash" \
  -F "targetLanguage=vi"
```

**Response** — Streaming NDJSON (`application/x-ndjson`):

```jsonl
{"index":0,"originalText":"Hello","translatedText":"Xin chào","status":"translating","completed":1,"total":100}
{"index":1,"originalText":"World","translatedText":"Thế giới","status":"translating","completed":2,"total":100}
...
{"index":99,"originalText":"Goodbye","translatedText":"Tạm biệt","status":"done","completed":100,"total":100}
```

> Full API documentation is available at `/docs` in the running app.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── translate/       # Internal translation API (UI use)
│   │   └── v1/              # Public REST API
│   │       ├── models/      # GET  /api/v1/models
│   │       └── translate/   # POST /api/v1/translate
│   ├── docs/                # Documentation page
│   ├── layout.tsx           # Root layout with theme & i18n providers
│   └── page.tsx             # Main translation page
├── components/
│   ├── AITranslation.tsx    # Translation orchestration
│   ├── AppHeader.tsx        # Navigation header
│   ├── ExportPanel.tsx      # File export options
│   ├── FileUpload.tsx       # File upload component
│   ├── LanguageSelector.tsx # Target language picker
│   ├── ModelSelector.tsx    # AI model picker
│   ├── TranslationTable.tsx # Side-by-side translation view
│   └── VideoPreview.tsx     # Video + subtitle preview
├── contexts/                # React context (Language, Theme)
├── hooks/                   # Custom hooks (analytics)
├── lib/
│   ├── ai-services/         # AI provider implementations
│   │   ├── base-translation-service.ts
│   │   ├── gemini-service.ts
│   │   ├── openai-service.ts
│   │   └── models.ts
│   ├── file-parser.ts       # Multi-format file parser
│   ├── file-exporter.ts     # Multi-format file exporter
│   ├── i18n.ts              # Internationalization strings
│   ├── rate-limiter.ts      # Upstash rate limiting
│   └── theme.ts             # Theme configuration
└── types/
    └── translation.ts       # TypeScript type definitions
```

## 🌍 Deployment

### Vercel (Recommended)

Deploy instantly with [Vercel](https://vercel.com):

1. Push to GitHub
2. Import project on Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

> **Important:** Streaming is enabled by default (`compress: false` in `next.config.ts`). If behind a reverse proxy (nginx, Cloudflare), handle compression at the proxy level.

### Self-hosted

```bash
npm run build
npm start
```

The app runs on port 3000 by default.

## 📄 License

This project is private.
