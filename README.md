# SubtitleAI - AI-Powered Subtitle Translation Tool

SubtitleAI is a modern web application that translates subtitle files using Google's Gemini AI. The application provides a sleek, user-friendly interface to upload subtitle files, translate them to various languages, and export the translated subtitles in multiple formats.

![SubtitleAI Preview](/public/og-image.jpg)

## Features

- **Multiple Format Support**: Translate SRT, VTT, and ASS subtitle files
- **Powered by Gemini AI**: High-quality translations with context awareness
- **Real-time Progress Tracking**: Monitor translation progress in real-time
- **Smart Batch Processing**: Optimizes API usage and improves translation quality
- **Context-Aware Translation**: Maintains consistency across related subtitles
- **Advanced Translation Controls**:
  - Pause/Resume functionality
  - Batch retry for failed translations
  - Manual editing of translated subtitles
- **AI Suggestions**: Get alternative translation suggestions for subtitles
- **Flexible Export Options**:
  - Export in original or different subtitle formats
  - Bilingual export with both original and translated text
- **Full Customization**: Customize prompts to control translation style and tone
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- A Google Gemini API key (https://ai.google.dev/)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/bihv/subtitle-translate-web-v2.git
   cd subtitle-translate-v2
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory and add the following:
   ```
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to http://localhost:3000

### Usage

1. Enter your Gemini API key
2. Upload a subtitle file (SRT, VTT, or ASS) via drag-and-drop or file selector
3. Choose your target language from the dropdown
4. Customize the translation prompt if needed
5. Click "Start Translation" to begin the process
6. Use the controls to pause, resume, or stop translation as needed
7. Edit any translations directly or use AI suggestions for improvements
8. Retry any failed translations individually or in batches
9. Export the translated subtitles in your preferred format

## Technical Details

- **Frontend**: Next.js 15.3.0 with React 19
- **UI Framework**: Tailwind CSS with ShadCN UI components
- **AI Integration**: Google Gemini AI through @google/generative-ai
- **Analytics**: Optional Google Analytics integration
- **SEO Optimization**: Open Graph images, metadata, and JSON-LD
- **Internationalization**: Multi-language support with context-aware translations

## API Key Security

**Client-side storage**: Your API key can be stored in browser storage for convenience

API keys are never sent to our servers and all translations occur directly between your browser and Google's API servers.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Generative AI for providing the translation capabilities
- Next.js team for the excellent framework
- ShadCN UI for the beautiful UI components
- All contributors to the project

---

Visit the live site: [translate.io.vn](https://translate.io.vn)
