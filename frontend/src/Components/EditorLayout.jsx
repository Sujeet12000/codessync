// frontend/src/components/EditorLayout.jsx

// frontend/src/components/EditorLayout.jsx
// frontend/src/components/EditorLayout.jsx
import CodeEditor from './CodeEditor';

const LANGUAGES = ['javascript', 'typescript', 'python', 'cpp', 'java', 'rust', 'go'];

const STATUS_META = {
  connected:    { label: '● Live',         cls: 'status-connected'    },
  connecting:   { label: '◌ Connecting…',  cls: 'status-connecting'   },
  disconnected: { label: '○ Disconnected', cls: 'status-disconnected' },
};

function EditorLayout({ roomId, username, status = 'connecting', clients = [], code, onCodeChange }) {
  const { label: statusLabel, cls: statusCls } = STATUS_META[status] ?? STATUS_META.connecting;

  return (
    <div className="editor-root">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="editor-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-icon">⌨</span>
          <span className="sidebar-title">CodeSync</span>
        </div>

        <div className="sidebar-meta">
          <div className="meta-block">
            <span className="meta-label">Room ID</span>
            <span
              className="meta-value meta-room"
              title="Click to copy"
              onClick={() => navigator.clipboard.writeText(roomId)}
            >
              {roomId}
            </span>
            <span className="meta-hint">click to copy</span>
          </div>

          <div className="meta-block">
            <span className="meta-label">Logged in as</span>
            <span className="meta-value meta-user">@{username}</span>
          </div>

          {/* Live collaborators list */}
          {clients.length > 0 && (
            <div className="meta-block">
              <span className="meta-label">
                In room ({clients.length})
              </span>
              <div className="clients-list">
                {clients.map((name) => (
                  <div key={name} className={`client-chip ${name === username ? 'client-self' : ''}`}>
                    <span className="client-dot">●</span>
                    {name}
                    {name === username && <span className="client-you">(you)</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <span className={`sidebar-status ${statusCls}`}>{statusLabel}</span>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="editor-main">

        <div className="editor-toolbar">
          <div className="toolbar-left">
            <span className="toolbar-file">main.js</span>
          </div>
          <div className="toolbar-right">
            <span className="toolbar-label">Language</span>
            <select className="toolbar-select" defaultValue="javascript" disabled>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="editor-canvas">
          <CodeEditor
            roomId={roomId}
            remoteCode={code}
            onLocalChange={onCodeChange}
          />
        </div>

      </main>
    </div>
  );
}

export default EditorLayout;