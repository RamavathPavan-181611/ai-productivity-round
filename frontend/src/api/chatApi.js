const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function readJson(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Request failed');
  return body;
}

export async function listThreads(query = '') {
  const url = new URL('/api/threads', API_BASE);
  if (query.trim()) url.searchParams.set('q', query.trim());
  const response = await fetch(url);
  return readJson(response);
}

export async function createThread(title = 'New conversation') {
  const response = await fetch(`${API_BASE}/api/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return readJson(response);
}

export async function getThread(id) {
  const response = await fetch(`${API_BASE}/api/threads/${id}`);
  return readJson(response);
}

export async function togglePin(id) {
  const response = await fetch(`${API_BASE}/api/threads/${id}/pin`, {
    method: 'PATCH',
  });
  return readJson(response);
}

export async function deleteThread(id) {
  const response = await fetch(`${API_BASE}/api/threads/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Could not delete thread');
}

export async function streamMessage(threadId, prompt, tone, onEvent) {
  const response = await fetch(
    `${API_BASE}/api/threads/${threadId}/messages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, tone }),
    },
  );

  if (!response.ok) throw new Error(await response.text());
  if (!response.body) throw new Error('Streaming is not supported');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const frames = buffer.split('\n\n');
    buffer = frames.pop() || '';

    for (const frame of frames) {
      let event = 'message';
      let data = '';
      for (const line of frame.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        if (line.startsWith('data:')) data += line.slice(5).trim();
      }
      if (!data) continue;
      onEvent(event, JSON.parse(data));
    }
  }
}

export function getExportUrl(threadId) {
  return `${API_BASE}/api/threads/${threadId}/export`;
}
