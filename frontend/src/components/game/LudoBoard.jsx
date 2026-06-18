import { useMemo } from 'react';
import {
  COMMON_PATH,
  SAFE_CELLS,
  START_CELLS,
  HOME_STRETCH,
  getVisualColor,
  PLAYER_COLORS,
  getTokenPosition,
} from '../../engine/ludoBoard';
import Token from './Token';
import './GameBoard.css';

// SVG Star for Safe Cells
const renderStar = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="#90A4AE"
    style={{ display: 'block', pointerEvents: 'none' }}
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

// SVG Arrow for track entry directions
const renderArrow = (direction, hexColor) => {
  const rotation = {
    right: 0,
    down: 90,
    left: 180,
    up: 270,
  }[direction];

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={hexColor}
      style={{
        transform: `rotate(${rotation}deg)`,
        display: 'block',
        pointerEvents: 'none',
      }}
    >
      <path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z" />
    </svg>
  );
};

// Yard Component for each quadrant
function Yard({ color, playersData, onTokenClick, validMoves }) {
  const player = playersData.find((p) => p.color === color);
  const baseTokens = player ? player.tokens.filter((t) => t.state === 'IN_BASE') : [];
  const visualColor = getVisualColor(color);

  // Position class for placing the quadrant on the grid
  const gridStyle = {
    red: { gridRow: '1 / 7', gridColumn: '1 / 7' },       // Green yard in reference image (Top-Left)
    green: { gridRow: '1 / 7', gridColumn: '10 / 16' },   // Yellow yard in reference image (Top-Right)
    yellow: { gridRow: '10 / 16', gridColumn: '10 / 16' }, // Blue yard in reference image (Bottom-Right)
    blue: { gridRow: '10 / 16', gridColumn: '1 / 7' },     // Red yard in reference image (Bottom-Left)
  }[color];

  return (
    <div className={`yard yard-${visualColor}`} style={gridStyle}>
      <div className="yard-inner">
        {Array.from({ length: 4 }).map((_, i) => {
          const token = baseTokens.find((t) => t.baseSlot === i);
          return (
            <div key={i} className={`yard-slot yard-slot-${visualColor}`}>
              {token && (
                <Token
                  token={token}
                  isMovable={validMoves.includes(token.id)}
                  onClick={onTokenClick}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// CenterHome Component for the center 3x3 triangles
function CenterHome({ playersData, onTokenClick, validMoves }) {
  // SVG overlay to render diagonal dividers
  const renderDividers = () => (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 3,
      }}
    >
      <line x1="0" y1="0" x2="100%" y2="100%" stroke="#333" strokeWidth="2.5" />
      <line x1="100%" y1="0" x2="0" y2="100%" stroke="#333" strokeWidth="2.5" />
    </svg>
  );

  // Home triangles token container positions and direction
  const triangleLayouts = [
    { color: 'red', visual: 'green', style: { left: '12%', top: '50%', transform: 'translateY(-50%)', flexDirection: 'column' } },
    { color: 'green', visual: 'yellow', style: { left: '50%', top: '12%', transform: 'translateX(-50%)', flexDirection: 'row' } },
    { color: 'yellow', visual: 'blue', style: { right: '12%', top: '50%', transform: 'translateY(-50%)', flexDirection: 'column' } },
    { color: 'blue', visual: 'red', style: { left: '50%', bottom: '12%', transform: 'translateX(-50%)', flexDirection: 'row' } },
  ];

  return (
    <div
      className="center-home"
      style={{
        gridRow: '7 / 10',
        gridColumn: '7 / 10',
        position: 'relative',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* 4 Triangles */}
      {triangleLayouts.map(({ color, visual, style }) => {
        const player = playersData.find((p) => p.color === color);
        const homeTokens = player ? player.tokens.filter((t) => t.state === 'HOME') : [];

        return (
          <div key={color} className={`center-triangle center-triangle-${visual}`}>
            {/* Tokens Container */}
            {homeTokens.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  ...style,
                }}
              >
                {homeTokens.map((token) => (
                  <Token
                    key={token.id}
                    token={token}
                    isMovable={validMoves.includes(token.id)}
                    onClick={onTokenClick}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Division overlay lines */}
      {renderDividers()}
    </div>
  );
}

export default function LudoBoard({ gameState, validMoves, onTokenClick }) {
  // Build a lookup: "row,col" → array of tokens on the track
  const tokenPositions = useMemo(() => {
    const map = {};
    for (const player of gameState.players) {
      for (const token of player.tokens) {
        if (token.state === 'ON_BOARD' || token.state === 'IN_HOME_STRETCH') {
          const [row, col] = getTokenPosition(token);
          const key = `${row},${col}`;
          if (!map[key]) map[key] = [];
          map[key].push(token);
        }
      }
    }
    return map;
  }, [gameState]);

  // Pre-compute cell classifications (tracks only)
  const cellInfo = useMemo(() => {
    const info = {};

    // Common path
    COMMON_PATH.forEach((pos, idx) => {
      const key = `${pos[0]},${pos[1]}`;
      const isSafe = SAFE_CELLS.has(idx);
      let startColor = null;
      for (const [col, startIdx] of Object.entries(START_CELLS)) {
        if (startIdx === idx) startColor = col;
      }
      info[key] = { type: 'path', index: idx, safe: isSafe, startColor };
    });

    // Home stretches
    for (const [color, cells] of Object.entries(HOME_STRETCH)) {
      cells.forEach((pos, idx) => {
        info[`${pos[0]},${pos[1]}`] = { type: 'home_stretch', color, index: idx };
      });
    }

    return info;
  }, []);

  const renderCell = (row, col) => {
    const key = `${row},${col}`;
    const cell = cellInfo[key];
    const tokens = tokenPositions[key] || [];

    let className = 'board-cell';
    let content = null;

    if (!cell) {
      return <div key={key} className="board-cell cell-empty" style={{ gridRow: row + 1, gridColumn: col + 1 }} />;
    }

    const startColorVisual = cell.startColor ? getVisualColor(cell.startColor) : null;
    const homeColorVisual = cell.color ? getVisualColor(cell.color) : null;

    switch (cell.type) {
      case 'path':
        className += ' cell-path';
        if (cell.safe && !cell.startColor) {
          className += ' cell-safe-star';
          content = renderStar();
        } else if (cell.startColor) {
          className += ` cell-start-${startColorVisual}`;
        }
        break;
      case 'home_stretch':
        className += ` cell-home-${homeColorVisual}`;
        break;
    }

    // Directional arrows
    if (row === 6 && col === 0) content = renderArrow('right', '#0F9D58'); // Green arrow (Top-Left)
    if (row === 0 && col === 8) content = renderArrow('down', '#F4B400');  // Yellow arrow (Top-Right)
    if (row === 8 && col === 14) content = renderArrow('left', '#4285F4'); // Blue arrow (Bottom-Right)
    if (row === 14 && col === 6) content = renderArrow('up', '#DB4437');   // Red arrow (Bottom-Left)

    return (
      <div
        key={key}
        className={className}
        style={{
          gridRow: row + 1,
          gridColumn: col + 1,
        }}
      >
        {content}
        {tokens.map((token, i) => (
          <Token
            key={token.id}
            token={token}
            isMovable={validMoves.includes(token.id)}
            onClick={onTokenClick}
            stackIndex={i}
          />
        ))}
      </div>
    );
  };

  const renderTrackCells = () => {
    const trackCells = [];

    // Top track
    for (let r = 0; r <= 5; r++) {
      for (let c = 6; c <= 8; c++) trackCells.push(renderCell(r, c));
    }
    // Left track
    for (let r = 6; r <= 8; r++) {
      for (let c = 0; c <= 5; c++) trackCells.push(renderCell(r, c));
    }
    // Right track
    for (let r = 6; r <= 8; r++) {
      for (let c = 9; c <= 14; c++) trackCells.push(renderCell(r, c));
    }
    // Bottom track
    for (let r = 9; r <= 14; r++) {
      for (let c = 6; c <= 8; c++) trackCells.push(renderCell(r, c));
    }

    return trackCells;
  };

  return (
    <div className="ludo-board">
      {/* 4 Quadrants / Yards */}
      {['red', 'green', 'yellow', 'blue'].map((color) => (
        <Yard
          key={color}
          color={color}
          playersData={gameState.players}
          onTokenClick={onTokenClick}
          validMoves={validMoves}
        />
      ))}

      {/* 72 Track Cells */}
      {renderTrackCells()}

      {/* 1 Center Home */}
      <CenterHome
        playersData={gameState.players}
        onTokenClick={onTokenClick}
        validMoves={validMoves}
      />
    </div>
  );
}
