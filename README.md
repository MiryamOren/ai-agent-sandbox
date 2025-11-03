# AI Chat Application

This is an AI-powered chat application built with [Next.js](https://nextjs.org) and the [Vercel AI SDK](https://sdk.vercel.ai/docs).

## Features

- 🤖 Real-time AI chat interface
- 💬 Streaming responses using Vercel AI SDK
- 🎨 Modern, responsive UI with Tailwind CSS
- ⚡ Built with Next.js 16 and React 19
- 🔄 Server-side streaming for optimal performance

## Prerequisites

- Node.js 20.9.0 or higher (recommended)
- npm, yarn, pnpm, or bun
- OpenAI API key (get one at [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys))

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory and add your OpenAI API key:

```bash
OPENAI_API_KEY=your-openai-api-key-here
```

You can get your API key from [OpenAI's platform](https://platform.openai.com/api-keys).

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to start chatting with the AI.

## Project Structure

```
ai-sdk/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # AI chat API endpoint
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main chat interface
│   └── globals.css           # Global styles
├── .env.local                # Environment variables (create this)
└── package.json
```

## Technology Stack

- **Framework:** Next.js 16 (App Router)
- **AI SDK:** Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`)
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript
- **AI Provider:** OpenAI GPT-4 Turbo

## Customization

### Change AI Model

Edit `app/api/chat/route.ts` to use a different model:

```typescript
const result = streamText({
  model: openai('gpt-3.5-turbo'), // or gpt-4, gpt-4o, etc.
  messages,
  system: 'You are a helpful AI assistant.',
});
```

### Modify System Prompt

Update the `system` parameter in `app/api/chat/route.ts`:

```typescript
system: 'Your custom system prompt here.',
```

### Use Different AI Providers

The Vercel AI SDK supports multiple providers. To use a different provider:

```bash
# Install the provider
npm install @ai-sdk/anthropic  # for Anthropic Claude
# or
npm install @ai-sdk/google     # for Google Gemini
```

Then update the import and model in `route.ts`:

```typescript
import { anthropic } from '@ai-sdk/anthropic';

const result = streamText({
  model: anthropic('claude-3-5-sonnet-20241022'),
  // ...
});
```

## Learn More

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new):

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository on Vercel
3. Add your `OPENAI_API_KEY` environment variable in the Vercel dashboard
4. Deploy!

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

MIT
