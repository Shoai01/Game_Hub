import { PLAYER_COLORS, getVisualColor } from '../../engine/ludoBoard';
import './GameBoard.css';

/**
 * Token component — a colored circular piece on the board.
 * @param {{ token: object, isMovable: boolean, onClick: function }} props
 */
export default function Token({ token, isMovable, onClick, stackIndex = 0 }) {
  const visualColor = getVisualColor(token.color);
  const colorClass = `token-${visualColor}`;
  const movableClass = isMovable ? 'token-movable' : '';
  const baseClass = token.state === 'IN_BASE' ? 'token-in-base' : '';
  const stackClass = token.state === 'IN_BASE' ? `token-stack-${stackIndex}` : '';

  const handleClick = (e) => {
    e.stopPropagation();
    if (isMovable && onClick) {
      onClick(token.id);
    }
  };

  return (
    <div
      className={`token ${colorClass} ${movableClass} ${baseClass} ${stackClass}`}
      onClick={handleClick}
      title={`${token.color} token${isMovable ? ' (click to move)' : ''}`}
      style={
        isMovable
          ? { boxShadow: `0 0 0 3px ${PLAYER_COLORS[token.color]}44, 0 2px 8px rgba(0,0,0,0.3)` }
          : undefined
      }
    />
  );
}
