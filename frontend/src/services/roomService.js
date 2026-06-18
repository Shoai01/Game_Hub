import api from './api';

const roomService = {
  /**
   * Create a new room
   * @param {{ maxPlayers: number }} data
   * @returns {Promise<object>} The created room
   */
  async createRoom({ maxPlayers = 4 }) {
    const response = await api.post('/room/create', { max_players: maxPlayers });
    return roomService._mapRoom(response.data);
  },

  /**
   * Join an existing room by code
   * @param {{ roomCode: string }} data
   * @returns {Promise<object>} The updated room
   */
  async joinRoom({ roomCode }) {
    const response = await api.post('/room/join', { room_code: roomCode.toUpperCase() });
    return roomService._mapRoom(response.data);
  },

  /**
   * Leave a room
   * @param {{ roomId: string }} data
   * @returns {Promise<object|null>} Updated room or null if room was closed
   */
  async leaveRoom({ roomId }) {
    const response = await api.post(`/room/${roomId}/leave`);
    if (!response.data) return null;
    return roomService._mapRoom(response.data);
  },

  /**
   * Toggle player ready status
   * @param {{ roomId: string }} data
   * @returns {Promise<object>} Updated room
   */
  async toggleReady({ roomId }) {
    const response = await api.post(`/room/${roomId}/toggle-ready`);
    return roomService._mapRoom(response.data);
  },

  /**
   * Get a room by ID
   * @param {string} roomId
   * @returns {Promise<object|null>}
   */
  async getRoom(roomId) {
    try {
      const response = await api.get(`/room/${roomId}`);
      return roomService._mapRoom(response.data);
    } catch (err) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  /**
   * Start the game (host only)
   * @param {{ roomId: string }} data
   * @returns {Promise<object>}
   */
  async startGame({ roomId }) {
    const response = await api.post(`/room/${roomId}/start`);
    return roomService._mapRoom(response.data);
  },

  /**
   * Get Ludo game state
   * @param {string} roomId
   * @returns {Promise<object>}
   */
  async getGameState(roomId) {
    const response = await api.get(`/room/${roomId}/game-state`);
    return response.data;
  },

  /**
   * Roll the dice on the server
   * @param {string} roomId
   * @returns {Promise<object>} Updated game state
   */
  async rollDice(roomId) {
    const response = await api.post(`/room/${roomId}/roll-dice`);
    return response.data;
  },

  /**
   * Move a token on the server
   * @param {string} roomId
   * @param {string} tokenId
   * @returns {Promise<object>} Updated game state
   */
  async moveToken(roomId, tokenId) {
    const response = await api.post(`/room/${roomId}/move-token`, { token_id: tokenId });
    return response.data;
  },

  /**
   * Map backend response to the shape the frontend components expect.
   * Backend uses snake_case, frontend uses camelCase.
   */
  _mapRoom(data) {
    return {
      id: data.id,
      code: data.code,
      hostId: data.host_id,
      maxPlayers: data.max_players,
      status: data.status,
      createdAt: data.created_at,
      players: (data.players || []).map((p) => ({
        id: p.user_id,
        username: p.username,
        avatar: p.avatar,
        isHost: p.is_host,
        isReady: p.is_ready,
        color: p.color,
        joinedAt: p.joined_at,
      })),
    };
  },
};

export default roomService;
