import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import {
  createThread,
  deleteThread,
  getExportUrl,
  getThread,
  listThreads,
  streamMessage,
  togglePin,
} from './api/chatApi';
import './App.css';

export default function App() {
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [thread, setThread] = useState(null);
  const [tone, setTone] = useState('Professional');
  const [prompt, setPrompt] = useState('');
  const [query, setQuery] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refreshThreads(search = '') {
    setLoading(true);
    try {
      const data = await listThreads(search);
      setThreads(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshThreads();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => refreshThreads(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  async function selectThread(id) {
    setError('');
    try {
      const data = await getThread(id);
      setThread(data);
      setActiveId(id);
      setPrompt('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function newThread() {
    setError('');
    try {
      const created = await createThread();
      setThread(created);
      setActiveId(created._id);
      setPrompt('');
      await refreshThreads(query);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function pinThread(id) {
    try {
      await togglePin(id);
      await refreshThreads(query);
      if (activeId === id) await selectThread(id);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function removeThread(id) {
    if (!window.confirm('Delete this conversation?')) return;
    try {
      await deleteThread(id);
      if (activeId === id) {
        setActiveId(null);
        setThread(null);
      }
      await refreshThreads(query);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function exportThread(id) {
    window.open(getExportUrl(id), '_blank', 'noopener,noreferrer');
  }

  async function sendMessage(value) {
    if (!thread) {
      try {
        const created = await createThread();
        setThread(created);
        setActiveId(created._id);
        await refreshThreads(query);
        await sendToThread(created._id, value);
      } catch (requestError) {
        setError(requestError.message);
      }
      return;
    }
    await sendToThread(thread._id, value);
  }

  async function sendToThread(id, value) {
    setError('');
    setPrompt('');
    setStreaming(true);

    setThread((current) => ({
      ...current,
      messages: [
        ...(current?.messages || []),
        { role: 'user', content: value, tone },
        { role: 'assistant', content: '', tone },
      ],
    }));

    try {
      await streamMessage(id, value, tone, (event, data) => {
        if (event === 'token') {
          setThread((current) => {
            if (!current) return current;
            const messages = [...current.messages];
            const assistantIndex = messages.length - 1;
            if (messages[assistantIndex]?.role === 'assistant') {
              messages[assistantIndex] = {
                ...messages[assistantIndex],
                content: `${messages[assistantIndex].content}${data.token}`,
              };
            }
            return { ...current, messages };
          });
        }
        if (event === 'done') {
          setThread((current) => {
            if (!current) return current;
            const messages = [...current.messages];
            const assistantIndex = messages.length - 1;
            messages[assistantIndex] = {
              ...messages[assistantIndex],
              content: data.content,
              metrics: data.metrics,
            };
            return { ...current, messages };
          });
        }
      });
      await selectThread(id);
      await refreshThreads(query);
    } catch (requestError) {
      setError(requestError.message);
      setThread((current) => {
        if (!current) return current;
        const messages = [...current.messages];
        if (messages.at(-1)?.role === 'assistant') messages.pop();
        return { ...current, messages };
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        threads={threads}
        activeId={activeId}
        query={query}
        onQueryChange={setQuery}
        onSelect={selectThread}
        onNew={newThread}
        onPin={pinThread}
        onDelete={removeThread}
        onExport={exportThread}
        loading={loading}
      />
      <ChatWindow
        thread={thread}
        streaming={streaming}
        tone={tone}
        onToneChange={setTone}
        onSend={sendMessage}
        onExport={exportThread}
        prompt={prompt}
        onPromptChange={setPrompt}
      />
      {error && (
        <div className="error-toast" role="alert">
          {error}
          <button type="button" onClick={() => setError('')}>×</button>
        </div>
      )}
    </div>
  );
}
