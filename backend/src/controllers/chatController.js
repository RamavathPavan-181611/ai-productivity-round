const mongoose = require("mongoose");
const Thread = require("../models/Thread");
const {
  streamToSse,
  writeSseEvent,
} = require("../services/aiService");

const SUPPORTED_TONES = ["Professional", "Casual", "Concise"];

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function validateThreadId(req, res) {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "Invalid thread ID" });
    return false;
  }
  return true;
}

async function createThread(req, res, next) {
  try {
    const title =
      typeof req.body.title === "string" && req.body.title.trim()
        ? req.body.title.trim().slice(0, 120)
        : "New conversation";

    const thread = await Thread.create({ title });
    res.status(201).json(thread);
  } catch (error) {
    next(error);
  }
}

async function listThreads(req, res, next) {
  try {
    const query = String(req.query.q || "").trim();
    const filter = query
      ? {
          $or: [
            { title: { $regex: escapeRegex(query), $options: "i" } },
            { "messages.content": { $regex: escapeRegex(query), $options: "i" } },
          ],
        }
      : {};

    const threads = await Thread.find(filter)
      .sort({ pinned: -1, updatedAt: -1 })
      .select("title pinned messages createdAt updatedAt")
      .lean();

    res.json(
      threads.map((thread) => ({
        ...thread,
        messageCount: thread.messages?.length || 0,
        preview:
          thread.messages?.at(-1)?.content ||
          "Start a new conversation",
      })),
    );
  } catch (error) {
    next(error);
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getThread(req, res, next) {
  try {
    if (!validateThreadId(req, res)) return;

    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.json(thread);
  } catch (error) {
    next(error);
  }
}

async function addMessage(req, res, next) {
  if (!validateThreadId(req, res)) return;

  try {
    const prompt =
      typeof req.body.prompt === "string" ? req.body.prompt.trim() : "";
    const tone = SUPPORTED_TONES.includes(req.body.tone)
      ? req.body.tone
      : "Professional";

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    if (prompt.length > 50000) {
      return res
        .status(400)
        .json({ error: "Prompt must not exceed 50000 characters" });
    }

    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    const startedAt = Date.now();
    const abortController = new AbortController();

    req.on("close", () => {
      if (!res.writableEnded) abortController.abort();
    });

    res.status(200);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    writeSseEvent(res, "start", {
      threadId: String(thread._id),
      tone,
    });

    const result = await streamToSse({
      response: res,
      prompt,
      tone,
      history: thread.messages,
      signal: abortController.signal,
    });

    if (abortController.signal.aborted) return;

    const latencyMs = Date.now() - startedAt;
    thread.messages.push(
      { role: "user", content: prompt, tone },
      {
        role: "assistant",
        content: result.content,
        tone,
        metrics: {
          latencyMs,
          wordCount: result.wordCount,
          tokenCount: result.tokenCount,
        },
      },
    );

    if (
      thread.title === "New conversation" &&
      thread.messages.filter((message) => message.role === "user").length <= 1
    ) {
      thread.title = createSmartTitle(prompt);
    }

    await thread.save();
    writeSseEvent(res, "done", {
      content: result.content,
      metrics: {
        latencyMs,
        wordCount: result.wordCount,
        tokenCount: result.tokenCount,
      },
    });
    res.end();
  } catch (error) {
    if (req.destroyed) return;
    next(error);
  }
}

function createSmartTitle(prompt) {
  const words = String(prompt)
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);

  if (!words.length) return "New conversation";
  const title = words.join(" ");
  return title.charAt(0).toUpperCase() + title.slice(1);
}

async function togglePin(req, res, next) {
  try {
    if (!validateThreadId(req, res)) return;

    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    thread.pinned = !thread.pinned;
    await thread.save();
    res.json({ id: String(thread._id), pinned: thread.pinned });
  } catch (error) {
    next(error);
  }
}

async function deleteThread(req, res, next) {
  try {
    if (!validateThreadId(req, res)) return;

    const thread = await Thread.findByIdAndDelete(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function exportThread(req, res, next) {
  try {
    if (!validateThreadId(req, res)) return;

    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    const lines = [
      `# ${thread.title}`,
      "",
      `Exported: ${new Date().toISOString()}`,
      "",
      "## Conversation",
      "",
    ];

    for (const message of thread.messages) {
      const speaker = message.role === "user" ? "User" : "Assistant";
      lines.push(`### ${speaker}`, "", message.content, "");

      if (message.role === "assistant" && message.metrics) {
        lines.push(
          `*Latency: ${message.metrics.latencyMs || 0} ms | Words: ${message.metrics.wordCount || 0} | Estimated tokens: ${message.metrics.tokenCount || 0}*`,
          "",
        );
      }
    }

    const safeTitle =
      thread.title
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() || "thread";

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeTitle}-${thread._id}.md"`,
    );
    res.send(lines.join("\n"));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createThread,
  listThreads,
  getThread,
  addMessage,
  togglePin,
  deleteThread,
  exportThread,
  createSmartTitle,
};
