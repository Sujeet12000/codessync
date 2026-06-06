// frontend/src/hooks/useSocket.js
import { useEffect, useRef, useState } from 'react';
import socket from '../socket/socket';

/**
 * @param {string} roomId
 * @param {string} username
 * @param {(code: string) => void} onRemoteCodeChange
 *   Called whenever another client sends a code change.
 *   The caller is responsible for applying it to the editor
 *   WITHOUT triggering a re-emit (loop prevention lives there).
 *
 * @returns {{ status: 'connecting'|'connected'|'disconnected', clients: string[] }}
 */
function useSocket(roomId, username, onRemoteCodeChange) {
  const [status,  setStatus]  = useState('connecting');
  const [clients, setClients] = useState([]);

  // Keep a stable ref to the callback so effects don't re-run on every render
  const onRemoteRef = useRef(onRemoteCodeChange);
  useEffect(() => { onRemoteRef.current = onRemoteCodeChange; }, [onRemoteCodeChange]);

  useEffect(() => {
    if (!roomId || !username) return;

    // ── Connect & join ───────────────────────────────────────────────────────
    socket.connect();

    
    // ── Listeners ────────────────────────────────────────────────────────────
    const onConnect = () => {
      setStatus('connected');
      // Re-join after a reconnect (socket gets a new internal state)
      socket.emit('join-room', { roomId, username });
    };

    const onDisconnect = () => setStatus('disconnected');

    const onRoomJoined = ({ code, clients: c }) => {
      setStatus('connected');
      setClients(c);
      // Apply server's authoritative code to local editor
      onRemoteRef.current(code);
    };

    const onReceiveCode = ({ code }) => {
      onRemoteRef.current(code);
    };

    const onUserJoined = ({ clients: c }) => setClients(c);
    const onUserLeft   = ({ clients: c }) => setClients(c);

    socket.on('connect',              onConnect);
    socket.on('disconnect',           onDisconnect);
    socket.on('room-joined',          onRoomJoined);
    socket.on('receive-code-change',  onReceiveCode);
    socket.on('user-joined',          onUserJoined);
    socket.on('user-left',            onUserLeft);

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      socket.off('connect',             onConnect);
      socket.off('disconnect',          onDisconnect);
      socket.off('room-joined',         onRoomJoined);
      socket.off('receive-code-change', onReceiveCode);
      socket.off('user-joined',         onUserJoined);
      socket.off('user-left',           onUserLeft);
      socket.disconnect();
    };
  }, [roomId, username]);

  return { status, clients };
}

export default useSocket;