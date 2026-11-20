const TONE_INSTRUCTIONS = Object.freeze({
  Professional:
    "Respond in a professional, clear, structured, and concise business tone.",
  Casual:
    "Respond in a friendly, casual, conversational, and approachable tone.",
  Concise:
    "Respond briefly and directly. Remove unnecessary details while preserving key information.",
});

const FALLBACK_PREFIX =
  "I am operating in demo mode because no AI provider key is configured.";

function getToneInstruction(tone) {
  return TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.Professional;
}

function getFallbackResponse(prompt) {
  const cleanPrompt =
    String(prompt || "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 500) || "your request";

  return `${FALLBACK_PREFIX}\n\nYou asked: "${cleanPrompt}"\n\nHere is a useful demo response:\n\n- I can explain, summarize, draft, or analyze text.\n- Add an OpenAI or Anthropic key to connect a live provider.\n- Professional, Casual, and Concise modes are still applied through the system instruction.\n\nPlease share a more specific requirement when you are ready.`;
}

function createTokenEstimate(text) {
  const words = String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.length ? Math.ceil(words.join(" ").length / 4) : 0;
}

async function streamOpenAI({ prompt, tone, history, signal }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const messages = [
    { role: "system", content: getToneInstruction(tone) },
    ...history
      .filter((message) => ["user", "assistant"].includes(message.role))
      .slice(-12)
      .map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: String(message.content),
      })),
    { role: "user", content: prompt },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `OpenAI request failed (${response.status}): ${await readErrorMessage(response)}`,
    );
  }
  if (!response.body) throw new Error("OpenAI returned an empty stream");

  return parseOpenAIStream(response.body);
}

async function* parseOpenAIStream(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffered = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffered += decoder.decode(value, { stream: true });
      const lines = buffered.split("\n");
      buffered = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;

        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") return;

        try {
          const data = JSON.parse(payload);
          const content = data.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // Ignore malformed provider events and continue with the stream.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

async function streamClaude({ prompt, tone, history, signal }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const messages = [
    ...history
      .filter((message) => ["user", "assistant"].includes(message.role))
      .slice(-12)
      .map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: String(message.content),
      })),
    { role: "user", content: prompt },
  ];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest",
      max_tokens: 1024,
      system: getToneInstruction(tone),
      messages,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Claude request failed (${response.status}): ${await readErrorMessage(response)}`,
    );
  }
  if (!response.body) throw new Error("Claude returned an empty stream");

  return parseClaudeStream(response.body);
}

async function* parseClaudeStream(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffered = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffered += decoder.decode(value, { stream: true });
      const lines = buffered.split("\n");
      buffered = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;

        try {
          const event = JSON.parse(trimmed.slice(5).trim());
          if (event.type === "content_block_delta") {
            const content = event.delta?.text;
            if (content) yield content;
          }
        } catch {
          // Ignore malformed provider events and continue with the stream.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

async function readErrorMessage(response) {
  try {
    const body = await response.json();
    return body.error?.message || body.message || "Unknown provider error";
  } catch {
    return "Unknown provider error";
  }
}

async function* streamFallback(prompt) {
  const text = getFallbackResponse(prompt);
  const chunks = text.match(/.{1,24}(?:\s|$)|.{1,24}/gs) || [text];

  for (const chunk of chunks) {
    yield chunk;
  }
}

async function createAIStream(options) {
  const provider = String(process.env.AI_PROVIDER || "openai").toLowerCase();
  let stream;

  try {
    if (provider === "claude" || provider === "anthropic") {
      stream = await streamClaude(options);
    } else {
      stream = await streamOpenAI(options);
    }

    if (!stream && provider === "openai") {
      stream = await streamClaude(options);
    }
  } catch (error) {
    if (options.signal?.aborted) throw error;
    console.error("AI provider unavailable:", error.message);
  }

  return stream || streamFallback(options.prompt);
}

function writeSseEvent(response, event, data) {
  response.write(`event: ${event}\n`);
  response.write(`data: ${JSON.stringify(data)}\n\n`);
}

async function streamToSse({
  response,
  prompt,
  tone = "Professional",
  history = [],
  signal,
}) {
  const stream = await createAIStream({ prompt, tone, history, signal });
  let content = "";

  for await (const chunk of stream) {
    if (signal?.aborted) break;
    content += chunk;
    writeSseEvent(response, "token", { token: chunk });
  }

  return {
    content,
    wordCount: content.trim()
      ? content.trim().split(/\s+/).length
      : 0,
    tokenCount: createTokenEstimate(content),
  };
}

module.exports = {
  TONE_INSTRUCTIONS,
  getToneInstruction,
  getFallbackResponse,
  createAIStream,
  streamToSse,
  writeSseEvent,
  createTokenEstimate,
};
