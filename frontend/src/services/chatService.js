import api from './api';

const chatService = {
  /**
   * Send a message to a room
   * @param {{ roomId: string, text: string }} data
   * @returns {Promise<object>} The created message
   */
  async sendMessage({ roomId, text }) {
    const response = await api.post(`/room/${roomId}/messages`, { text: text.trim() });
    return chatService._mapMessage(response.data);
  },

  /**
   * Get all messages for a room (or messages after a specific message ID)
   * @param {string} roomId
   * @param {string|null} afterId - Optional message ID to fetch only newer messages
   * @returns {Promise<object[]>}
   */
  async getMessages(roomId, afterId = null) {
    const params = {};
    if (afterId) params.after = afterId;
    const response = await api.get(`/room/${roomId}/messages`, { params });
    return (response.data || []).map(chatService._mapMessage);
  },

  /**
   * Map backend snake_case to frontend camelCase
   */
  _mapMessage(msg) {
    return {
      id: msg.id,
      roomId: msg.room_id,
      userId: msg.user_id,
      username: msg.username,
      text: msg.text,
      timestamp: msg.timestamp,
    };
  },
};

export default chatService;
