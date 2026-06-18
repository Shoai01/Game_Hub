import { useEffect, useRef } from 'react';
import './GameBoard.css';

/**
 * Scrollable game event log.
 * @param {{ log: object[] }} props
 */
export default function GameLog({ log }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  if (log.length === 0) {
    return (
      <div className="game-log">
        <p style={{ color: '#aaa', textAlign: 'center', fontSize: '0.8rem', margin: '16px 0' }}>
          Game log will appear here...
        </p>
      </div>
    );
  }

  return (
    <div className="game-log">
      {log.map((entry, i) => (
        <div
          key={i}
          className={`game-log-entry ${entry.color ? `log-color-${entry.color}` : ''}`}
        >
          {entry.message}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
