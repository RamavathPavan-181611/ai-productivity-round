# AI Chat Assistant - Implementation Tracker

## Completed

- [x] Initialize Git repository and public GitHub remote
- [x] Create separate `backend` and `frontend` folders
- [x] Install backend dependencies: Express, Mongoose, CORS, dotenv
- [x] Scaffold the React + Vite frontend
- [x] Add backend environment variable template
- [x] Create source folder structure
- [x] Commit and push the initial project scaffold
- [x] Verify that the frontend production build succeeds

## Remaining Work

### 1. Backend Foundation

- [x] Configure MongoDB connection in `backend/src/config/db.js`
- [x] Create the Thread Mongoose model
- [x] Add message structure, timestamps, tone, pin status, and response metrics
- [x] Create the Express server entry point
- [x] Add request validation and consistent JSON error responses
- [x] Add backend scripts for development and startup

### 2. AI Service

- [x] Map Professional, Casual, and Concise tones to system instructions
- [x] Integrate OpenAI streaming
- [x] Integrate Claude streaming
- [x] Add a server-side fallback response when no API key is available
- [x] Stream text to the browser using Server-Sent Events
- [x] Abort or handle provider failures safely

### 3. Thread API

- [x] `POST /api/threads` - create a thread
- [x] `GET /api/threads?q=` - search, pin-first, and recent-first thread listing
- [x] `GET /api/threads/:id` - load message history
- [x] `POST /api/threads/:id/messages` - validate and stream a chat response
- [x] `PATCH /api/threads/:id/pin` - toggle pin status
- [x] `DELETE /api/threads/:id` - delete a thread
- [x] `GET /api/threads/:id/export` - return a downloadable Markdown transcript

### 4. Backend Value-Adds

- [x] Generate and update a smart thread title from the first prompt
- [x] Compile Markdown transcripts on the server
- [x] Calculate response latency in milliseconds
- [x] Calculate response word count
- [x] Add estimated token count or provider token metrics

### 5. Frontend UI

- [x] Replace scaffold UI with the AI chat assistant interface
- [x] Build `Sidebar.jsx` with thread history
- [x] Add thread search from the server
- [x] Add pin and delete controls
- [x] Add Markdown export control
- [x] Build `ChatWindow.jsx` with distinct user and AI bubbles
- [x] Display character-by-character SSE streaming
- [x] Build `ToneSelector.jsx` for Professional, Casual, and Concise
- [x] Create `chatApi.js` for HTTP and SSE requests
- [x] Add loading, empty, and error states
- [x] Add responsive custom CSS
- [x] Remove unused Vite scaffold assets

### 6. Integration and Verification

- [x] Start MongoDB locally or provide a MongoDB connection for evaluation
- [x] Verify thread creation and history loading
- [x] Verify all three tone modes
- [x] Verify real-time streaming with and without an API key
- [x] Verify search, pinning, deletion, and export
- [ ] Verify mobile and desktop layouts
- [x] Verify backend and frontend builds
- [x] Add setup and environment instructions to `README.md`

### 7. Final Submission

- [ ] Make incremental Git commits for each major feature
- [ ] Push all commits before 11:30 AM
- [ ] Confirm the repository remains public
- [ ] Confirm the submitted GitHub URL
- [ ] Prepare short viva explanations for architecture and extra features
