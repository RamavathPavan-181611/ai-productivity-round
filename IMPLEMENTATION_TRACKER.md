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

- [ ] Configure MongoDB connection in `backend/src/config/db.js`
- [ ] Create the Thread Mongoose model
- [ ] Add message structure, timestamps, tone, pin status, and response metrics
- [ ] Create the Express server entry point
- [ ] Add request validation and consistent JSON error responses
- [ ] Add backend scripts for development and startup

### 2. AI Service

- [ ] Map Professional, Casual, and Concise tones to system instructions
- [ ] Integrate OpenAI streaming
- [ ] Integrate Claude streaming
- [ ] Add a server-side fallback response when no API key is available
- [ ] Stream text to the browser using Server-Sent Events
- [ ] Abort or handle provider failures safely

### 3. Thread API

- [ ] `POST /api/threads` - create a thread
- [ ] `GET /api/threads?q=` - search, pin-first, and recent-first thread listing
- [ ] `GET /api/threads/:id` - load message history
- [ ] `POST /api/threads/:id/messages` - validate and stream a chat response
- [ ] `PATCH /api/threads/:id/pin` - toggle pin status
- [ ] `DELETE /api/threads/:id` - delete a thread
- [ ] `GET /api/threads/:id/export` - return a downloadable Markdown transcript

### 4. Backend Value-Adds

- [ ] Generate and update a smart thread title from the first prompt
- [ ] Compile Markdown transcripts on the server
- [ ] Calculate response latency in milliseconds
- [ ] Calculate response word count
- [ ] Add estimated token count or provider token metrics

### 5. Frontend UI

- [ ] Replace scaffold UI with the AI chat assistant interface
- [ ] Build `Sidebar.jsx` with thread history
- [ ] Add thread search from the server
- [ ] Add pin and delete controls
- [ ] Add Markdown export control
- [ ] Build `ChatWindow.jsx` with distinct user and AI bubbles
- [ ] Display character-by-character SSE streaming
- [ ] Build `ToneSelector.jsx` for Professional, Casual, and Concise
- [ ] Create `chatApi.js` for HTTP and SSE requests
- [ ] Add loading, empty, and error states
- [ ] Add responsive custom CSS
- [ ] Remove unused Vite scaffold assets

### 6. Integration and Verification

- [ ] Start MongoDB locally or provide a MongoDB connection for evaluation
- [ ] Verify thread creation and history loading
- [ ] Verify all three tone modes
- [ ] Verify real-time streaming with and without an API key
- [ ] Verify search, pinning, deletion, and export
- [ ] Verify mobile and desktop layouts
- [ ] Verify backend and frontend builds
- [ ] Add setup and environment instructions to `README.md`

### 7. Final Submission

- [ ] Make incremental Git commits for each major feature
- [ ] Push all commits before 11:30 AM
- [ ] Confirm the repository remains public
- [ ] Confirm the submitted GitHub URL
- [ ] Prepare short viva explanations for architecture and extra features
