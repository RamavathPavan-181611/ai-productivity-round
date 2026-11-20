export default function Sidebar({
  threads,
  activeId,
  query,
  onQueryChange,
  onSelect,
  onNew,
  onPin,
  onDelete,
  onExport,
  loading,
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">AI</div>
        <div>
          <strong>Chat Assistant</strong>
          <span>Quantiphi</span>
        </div>
      </div>

      <button type="button" className="new-chat" onClick={onNew}>
        <span>+</span> New chat
      </button>

      <div className="search-box">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search conversations"
          aria-label="Search conversations"
        />
      </div>

      <div className="thread-heading">
        <span>Recent chats</span>
        {loading && <span className="loading-dot" />}
      </div>

      <nav className="thread-list" aria-label="Conversation history">
        {threads.map((thread) => (
          <div
            key={thread._id}
            className={activeId === thread._id ? 'thread-item active' : 'thread-item'}
          >
            <button
              type="button"
              className="thread-select"
              onClick={() => onSelect(thread._id)}
            >
              <span className="thread-title">
                {thread.pinned && <b aria-label="Pinned">★ </b>}
                {thread.title}
              </span>
              <span className="thread-preview">{thread.preview}</span>
            </button>
            <div className="thread-actions">
              <button type="button" onClick={() => onPin(thread._id)} title="Pin">
                {thread.pinned ? '★' : '☆'}
              </button>
              <button type="button" onClick={() => onExport(thread._id)} title="Export Markdown">
                ↓
              </button>
              <button type="button" onClick={() => onDelete(thread._id)} title="Delete">
                ×
              </button>
            </div>
          </div>
        ))}
        {!loading && threads.length === 0 && (
          <p className="sidebar-empty">No conversations found.</p>
        )}
      </nav>
    </aside>
  );
}
