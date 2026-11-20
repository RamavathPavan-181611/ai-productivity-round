const express = require("express");
const {
  createThread,
  listThreads,
  getThread,
  addMessage,
  togglePin,
  deleteThread,
  exportThread,
} = require("../controllers/chatController");

const router = express.Router();

router.get("/api/threads", listThreads);
router.post("/api/threads", createThread);
router.get("/api/threads/:id", getThread);
router.post("/api/threads/:id/messages", addMessage);
router.patch("/api/threads/:id/pin", togglePin);
router.delete("/api/threads/:id", deleteThread);
router.get("/api/threads/:id/export", exportThread);

module.exports = router;
