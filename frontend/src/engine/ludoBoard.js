/**
 * Ludo Board Layout — Maps logical cell indices to 15×15 grid positions.
 *
 * Standard Ludo board is a 15×15 grid with:
 * - 4 colored quadrants (6×6 each) in the corners for base yards
 * - A cross-shaped path running through the center
 * - 52 common cells forming the outer loop
 * - 4 home stretches (5 cells each) running toward the center
 * - 1 center home (the winning triangle)
 */

// ── Common Path (52 cells, clockwise, starting from Red's exit) ──
// Each entry: [row, col]  on the 15×15 grid (0-indexed)
export const COMMON_PATH = [
  // Red exit → moving right along top of bottom-left quadrant
  [6, 1], // 0  - Red start
  [6, 2], // 1
  [6, 3], // 2
  [6, 4], // 3
  [6, 5], // 4
  [5, 6], // 5  - Turn up
  [4, 6], // 6
  [3, 6], // 7
  [2, 6], // 8  - Star/Safe
  [1, 6], // 9
  [0, 6], // 10 - Corner
  [0, 7], // 11 - Turn right
  [0, 8], // 12 - Corner
  [1, 8], // 13 - Green start
  [2, 8], // 14
  [3, 8], // 15
  [4, 8], // 16
  [5, 8], // 17
  [6, 9], // 18 - Turn right
  [6, 10],// 19
  [6, 11],// 20
  [6, 12],// 21 - Star/Safe
  [6, 13],// 22
  [6, 14],// 23 - Corner
  [7, 14],// 24 - Turn down
  [8, 14],// 25 - Corner
  [8, 13],// 26 - Yellow start
  [8, 12],// 27
  [8, 11],// 28
  [8, 10],// 29
  [8, 9], // 30
  [9, 8], // 31 - Turn down
  [10, 8],// 32
  [11, 8],// 33
  [12, 8],// 34 - Star/Safe
  [13, 8],// 35
  [14, 8],// 36 - Corner
  [14, 7],// 37 - Turn left
  [14, 6],// 38 - Corner
  [13, 6],// 39 - Blue start
  [12, 6],// 40
  [11, 6],// 41
  [10, 6],// 42
  [9, 6], // 43
  [8, 5], // 44 - Turn left
  [8, 4], // 45
  [8, 3], // 46
  [8, 2], // 47 - Star/Safe
  [8, 1], // 48
  [8, 0], // 49 - Corner
  [7, 0], // 50 - Turn up
  [6, 0], // 51 - Corner (Red re-entry before home)
];

// ── Start Cells (where tokens enter the board after rolling a 6) ──
export const START_CELLS = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// ── Safe Cells (start positions + star positions — no capture allowed) ──
export const SAFE_CELLS = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// ── Home Entry Points (the last common cell before entering home stretch) ──
// After this cell, the player enters their colored home stretch
export const HOME_ENTRY = {
  red: 50,    // After cell 50, enter red home stretch
  green: 11,  // After cell 11, enter green home stretch
  yellow: 24, // After cell 24, enter yellow home stretch
  blue: 37,   // After cell 37, enter blue home stretch
};

// ── Home Stretches (5 cells each leading to center) ──
// [row, col] for each home stretch cell
export const HOME_STRETCH = {
  red: [
    [7, 1], // H0
    [7, 2], // H1
    [7, 3], // H2
    [7, 4], // H3
    [7, 5], // H4
  ],
  green: [
    [1, 7], // H0
    [2, 7], // H1
    [3, 7], // H2
    [4, 7], // H3
    [5, 7], // H4
  ],
  yellow: [
    [7, 13], // H0
    [7, 12], // H1
    [7, 11], // H2
    [7, 10], // H3
    [7, 9],  // H4
  ],
  blue: [
    [13, 7], // H0
    [12, 7], // H1
    [11, 7], // H2
    [10, 7], // H3
    [9, 7],  // H4
  ],
};

// ── Center Home ──
export const CENTER_HOME = [7, 7];

// ── Base Yard Positions (where tokens sit before entering the board) ──
export const BASE_YARDS = {
  red: [
    [2, 2], [2, 4],
    [4, 2], [4, 4],
  ],
  green: [
    [2, 10], [2, 12],
    [4, 10], [4, 12],
  ],
  yellow: [
    [10, 10], [10, 12],
    [12, 10], [12, 12],
  ],
  blue: [
    [10, 2], [10, 4],
    [12, 2], [12, 4],
  ],
};

// ── Quadrant Boundaries (for coloring the board) ──
export const QUADRANTS = {
  red:    { rowStart: 0, rowEnd: 5, colStart: 0, colEnd: 5, color: '#EF5350' },
  green:  { rowStart: 0, rowEnd: 5, colStart: 9, colEnd: 14, color: '#66BB6A' },
  yellow: { rowStart: 9, rowEnd: 14, colStart: 9, colEnd: 14, color: '#FDD835' },
  blue:   { rowStart: 9, rowEnd: 14, colStart: 0, colEnd: 5, color: '#42A5F5' },
};

// ── Player Colors (CSS values, mapped to visual colors) ──
export const PLAYER_COLORS = {
  red: '#0F9D58',   // Green (Top-Left)
  green: '#F4B400', // Yellow (Top-Right)
  yellow: '#4285F4',// Blue (Bottom-Right)
  blue: '#DB4437',  // Red (Bottom-Left)
};

/**
 * Maps a logical player/token color (used in backend logic)
 * to its visual counterpart on the board (based on user reference image).
 * - Logical red (top-left) -> Green
 * - Logical green (top-right) -> Yellow
 * - Logical yellow (bottom-right) -> Blue
 * - Logical blue (bottom-left) -> Red
 */
export function getVisualColor(logicalColor) {
  const mapping = {
    red: 'green',
    green: 'yellow',
    yellow: 'blue',
    blue: 'red',
  };
  return mapping[logicalColor] || logicalColor;
}

/**
 * Get the grid position for a token based on its state.
 * @param {{ state: string, commonIndex: number, homeIndex: number, baseSlot: number, color: string }} token
 * @returns {[number, number]} [row, col]
 */
export function getTokenPosition(token) {
  switch (token.state) {
    case 'IN_BASE':
      return BASE_YARDS[token.color][token.baseSlot];
    case 'ON_BOARD':
      return COMMON_PATH[token.commonIndex];
    case 'IN_HOME_STRETCH':
      return HOME_STRETCH[token.color][token.homeIndex];
    case 'HOME':
      return CENTER_HOME;
    default:
      return BASE_YARDS[token.color][token.baseSlot];
  }
}

/**
 * Get the full path for a player color (common path starting from their start cell).
 * Returns array of common cell indices in traversal order for that color.
 */
export function getPlayerPath(color) {
  const start = START_CELLS[color];
  const path = [];
  for (let i = 0; i < 52; i++) {
    path.push((start + i) % 52);
  }
  return path;
}
