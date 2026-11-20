import { useEffect, useRef } from 'react';
import ToneSelector from './ToneSelector';

export default function ChatWindow({
  thread,
  streaming,
  tone,
  onToneChange,
  onSend,
  onExport,
  prompt,
  onPromptChange,
}) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages, streaming]);

  function submit(event) {
    event.preventDefault();
    if (prompt.trim() && !streaming) onSend(prompt.trim());
  }

  const messages = thread?.messages || [];

  return (
    <main className="chat-main">
      <header className="chat-header">
        <div>
          <span className="status-dot" />
          <strong>{thread?.title || 'AI Chat Assistant'}</strong>
        </div>
        {thread && (
          <button type="button" className="export-button" onClick={() => onExport(thread._id)}>
            Export .md
          </button>
        )}
      </header>

      <div className="messages">
        {messages.length === 0 && (
          <div className="welcome">
            <div className="welcome-mark">AI</div>
            <h1>How can I help you?</h1>
            <p>Ask a question, draft content, or analyze an idea.</p>
            <div className="suggestions">
              {['Explain a difficult topic', 'Draft a professional email', 'Summarize key ideas'].map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => onPromptChange(suggestion)}
                  >
                    {suggestion}
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <article
            key={`${message._id || index}-${index}`}
            className={`message-row ${message.role}`}
          >
            <div className="avatar">{message.role === 'user' ? 'You' : 'AI'}</div>
            <div className="message-content">
              <div className="message-label">
                {message.role === 'user' ? 'You' : 'Assistant'}
                {message.tone && message.role === 'assistant' && (
                  <span>{message.tone}</span>
                )}
              </div>
              <div className="bubble">{message.content}</div>
              {message.metrics?.latencyMs !== undefined && (
                <div className="metrics">
                  {message.metrics.latencyMs} ms · {message.metrics.wordCount} words ·{' '}
                  {message.metrics.tokenCount} est. tokens
                </div>
              )}
            </div>
          </article>
        ))}
        {streaming && (
          <div className="streaming-indicator"><span /><span /><span /></div>
        )}
        <div ref={endRef} />
      </div>

      <footer className="composer-wrap">
        <ToneSelector tone={tone} onChange={onToneChange} />
        <form className="composer" onSubmit={submit}>
          <textarea
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                if (prompt.trim() && !streaming) onSend(prompt.trim());
              }
            }}
            placeholder="Message the AI assistant..."
            rows={2}
            disabled={streaming}
          />
          <button type="submit" disabled={!prompt.trim() || streaming} aria-label="Send message">
            ↑
          </button>
        </form>
      </footer>
    </main>
  );
}
