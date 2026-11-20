# AI Chat Assistant

A full-stack chat application built with React, Vite, Express, Mongoose, MongoDB, OpenAI, and Claude.

## Features

- Real-time Server-Sent Events streaming
- Professional, Casual, and Concise response tones
- Conversation history with server-side search
- Pin, delete, and Markdown export actions
- Smart first-prompt thread titles
- Server-computed latency, word count, and estimated token count
- Automatic demo fallback when no provider API key is configured

## Prerequisites

- Node.js 20 or newer
- MongoDB running locally or a MongoDB Atlas connection string
- Optional: OpenAI or Anthropic API key

## Setup

1. Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

2. Configure the backend:

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ai-chat-assistant
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
AI_PROVIDER=openai
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_MODEL=claude-3-5-haiku-latest
```

Set `AI_PROVIDER=openai` or `AI_PROVIDER=claude`. Leave both API keys empty to use the automatic demo fallback.

3. Start MongoDB locally:

```bash
mongod --dbpath ./mongo-data --bind_ip 127.0.0.1 --port 27017
```

For evaluation, a MongoDB Atlas URI may be supplied through `MONGODB_URI`.

## Run

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## API

- `GET /api/health`
- `GET /api/threads?q=`
- `POST /api/threads`
- `GET /api/threads/:id`
- `POST /api/threads/:id/messages`
- `PATCH /api/threads/:id/pin`
- `DELETE /api/threads/:id`
- `GET /api/threads/:id/export`

## Verification

```bash
cd backend
npm test
npm start
```

In another terminal:

```bash
cd frontend
npm run build
npm run lint
npm run dev
```
