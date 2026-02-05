
const storage = {
  /**
   * Get a value from storage.
   * @param {string} key - The storage key.
   * @param {boolean} shared - Whether this is shared data.
   * @returns {Promise<{key: string, value: any, shared: boolean} | null>}
   */
  async get(key, shared = false) {
    try {
      const storageKey = shared ? `shared:${key}` : `user:${key}`;
      const value = localStorage.getItem(storageKey);

      if (value === null) {
        return null;
      }

      try {
        return { key, value: JSON.parse(value), shared };
      } catch (e) {
        return { key, value, shared };
      }
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  /**
   * Set a value in storage.
   * @param {string} key - The storage key.
   * @param {any} value - The value to store.
   * @param {boolean} shared - Whether this is shared data.
   * @returns {Promise<{key: string, value: any, shared: boolean} | null>}
   */
  async set(key, value, shared = false) {
    try {
      const storageKey = shared ? `shared:${key}` : `user:${key}`;
      const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(storageKey, valueToStore);

      console.log(`[Storage] Set ${shared ? 'SHARED' : 'USER'} key: ${key}`);
      return { key, value, shared };
    } catch (error) {
      console.error('Storage set error:', error);
      return null;
    }
  },

  /**
   * Delete a value from storage.
   * @param {string} key - The storage key.
   * @param {boolean} shared - Whether this is shared data.
   * @returns {Promise<{key: string, deleted: boolean, shared: boolean} | null>}
   */
  async delete(key, shared = false) {
    try {
      const storageKey = shared ? `shared:${key}` : `user:${key}`;
      localStorage.removeItem(storageKey);

      console.log(`[Storage] Deleted ${shared ? 'SHARED' : 'USER'} key: ${key}`);
      return { key, deleted: true, shared };
    } catch (error) {
      console.error('Storage delete error:', error);
      return null;
    }
  },

  /**
   * List all keys with a given prefix.
   * @param {string} prefix - The key prefix to filter by.
   * @param {boolean} shared - Whether to list shared data.
   * @returns {Promise<{keys: string[], prefix: string, shared: boolean}>}
   */
  async list(prefix = '', shared = false) {
    try {
      const searchPrefix = shared ? `shared:${prefix}` : `user:${prefix}`;
      const keys = Object.keys(localStorage)
        .filter(k => k.startsWith(searchPrefix))
        .map(k => k.replace(/^(shared:|user:)/, ''));

      return { keys, prefix, shared };
    } catch (error) {
      console.error('Storage list error:', error);
      return { keys: [], prefix, shared };
    }
  },

  async clearAll() {
    localStorage.clear();
    console.log('[Storage] Cleared all data');
  },

  /**
   * Get storage statistics.
   * @returns {object}
   */
  getStats() {
    const keys = Object.keys(localStorage);
    const sharedKeys = keys.filter(k => k.startsWith('shared:'));
    const userKeys = keys.filter(k => k.startsWith('user:'));
    const totalSize = JSON.stringify(localStorage).length;

    return {
      totalKeys: keys.length,
      sharedKeys: sharedKeys.length,
      userKeys: userKeys.length,
      totalSize,
    };
  }
};

export default storage;