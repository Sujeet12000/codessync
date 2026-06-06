// frontend/src/pages/Home.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [roomId, setRoomId]     = useState('');
  const [error, setError]       = useState('');

  const validate = () => {
    if (!username.trim()) {
      setError('Username is required.');
      return false;
    }
    setError('');
    return true;
  };

  const handleCreateRoom = () => {
    if (!validate()) return;
    const newRoomId = uuidv4();
    navigate(`/editor/${newRoomId}`, {
      state: { username: username.trim() },
    });
  };

  const handleJoinRoom = () => {
    if (!validate()) return;
    if (!roomId.trim()) {
      setError('Room ID is required to join.');
      return;
    }
    navigate(`/editor/${roomId.trim()}`, {
      state: { username: username.trim() },
    });
  };

  return (
    <div className="home-root">
      <div className="home-card">
        <div className="home-brand">
          <span className="brand-icon">⌨</span>
          <h1 className="brand-name">CodeSync</h1>
          <p className="brand-sub">Collaborative editing, in real time.</p>
        </div>

        {error && <div className="home-error">{error}</div>}

        <div className="home-fields">
          <div className="field-group">
            <label htmlFor="username">Your Username</label>
            <input
              id="username"
              type="text"
              placeholder="e.g. sujeet_dev"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
          </div>

          <div className="field-group">
            <label htmlFor="roomId">Room ID</label>
            <input
              id="roomId"
              type="text"
              placeholder="Paste a room ID to join"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
          </div>
        </div>

        <div className="home-actions">
          <button className="btn btn-primary" onClick={handleJoinRoom}>
            Join Room
          </button>
          <button className="btn btn-ghost" onClick={handleCreateRoom}>
            + Create Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;