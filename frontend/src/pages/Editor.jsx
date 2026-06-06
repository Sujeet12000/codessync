
// frontend/src/pages/Editor.jsx
// frontend/src/pages/Editor.jsx
// frontend/src/pages/Editor.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate }      from 'react-router-dom';
import EditorLayout from '../components/EditorLayout';
import useSocket    from '../hooks/useSocket';
import '../styles/Editor.css';

function Editor() {
  const { roomId } = useParams();
  const { state }  = useLocation();
  const navigate   = useNavigate();

  const username = state?.username;

  // Shared code state — single source of truth for this tab
  const [code, setCode] = useState(null);   // null = "not yet synced from server"

  // Guard: no username → home
  useEffect(() => {
    if (!username) navigate('/', { replace: true });
  }, [username, navigate]);

  // Called by useSocket when the server pushes a remote change
  const handleRemoteChange = useCallback((incomingCode) => {
    setCode(incomingCode);
  }, []);

  const { status, clients } = useSocket(roomId, username, handleRemoteChange);

  if (!username) return null;

  return (
    <EditorLayout
      roomId={roomId}
      username={username}
      status={status}
      clients={clients}
      code={code}
      onCodeChange={setCode}
    />
  );
}

export default Editor;