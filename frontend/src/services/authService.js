import api from './api';

const TOKEN_KEY = 'gamehub_token';
const USER_KEY = 'gamehub_user';

const authService = {
  /**
   * Register a new user
   * @param {{ username: string, email: string, password: string }} data
   * @returns {Promise<{ user: object, token: string }>}
   */
  async register({ username, email, password }) {
    const response = await api.post('/auth/register', { username, email, password });
    const { access_token, user } = response.data;

    localStorage.setItem(TOKEN_KEY, access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { user, token: access_token };
  },

  /**
   * Login an existing user
   * @param {{ email: string, password: string }} data
   * @returns {Promise<{ user: object, token: string }>}
   */
  async login({ email, password }) {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user } = response.data;

    localStorage.setItem(TOKEN_KEY, access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { user, token: access_token };
  },

  /**
   * Logout the current user
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error on server:', err);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  /**
   * Get the currently logged-in user from storage
   * @returns {object|null}
   */
  getCurrentUser() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;

      // Decode JWT payload to verify expiry
      const parts = token.split('.');
      if (parts.length !== 3) {
        this.logout();
        return null;
      }
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      // exp is in seconds in standard JWT
      if (payload.exp * 1000 < Date.now()) {
        this.logout();
        return null;
      }

      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch (e) {
      return null;
    }
  },

  /**
   * Update user profile
   * @param {{ username?: string, avatar?: string }} updates
   * @returns {Promise<object>}
   */
  async updateProfile(updates) {
    const response = await api.put('/auth/me', updates);
    const updatedUser = response.data;

    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },
};

export default authService;
