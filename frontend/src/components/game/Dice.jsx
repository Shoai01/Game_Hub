import { useState } from 'react';
import './GameBoard.css';

/**
 * Dice dot layout for values 1-6.
 * Grid positions (0-8) mapping to a 3×3 grid:
 *   0 1 2
 *   3 4 5
 *   6 7 8
 */
const DICE_FACES = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/**
 * Visual dice with dot faces and roll animation.
 * @param {{ value: number|null, canRoll: boolean, onRoll: function, playerColor: string }} props
 */
export default function Dice({ value, canRoll, onRoll, playerColor }) {
  const [rolling, setRolling] = useState(false);

  const handleClick = () => {
    if (!canRoll || rolling) return;
    setRolling(true);
    setTimeout(() => {
      setRolling(false);
      onRoll();
    }, 500);
  };

  const displayValue = value || 1;
  const dots = DICE_FACES[displayValue] || [];

  return (
    <div className="dice-container">
      <div
        className={`dice ${rolling ? 'dice-rolling' : ''} ${!canRoll ? 'dice-disabled' : ''}`}
        onClick={handleClick}
        style={
          canRoll && !rolling
            ? { borderColor: playerColor || '#1B4F8A' }
            : undefined
        }
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={`dice-dot ${dots.includes(i) ? 'dice-dot-filled' : ''}`}
          />
        ))}
      </div>
      {canRoll && !rolling && (
        <span
          style={{
            fontSize: '0.75rem',
            color: '#888',
            fontWeight: 500,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          Click to roll
        </span>
      )}
    </div>
  );
}
