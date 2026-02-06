/**
 * IndexedDB Storage Module
 * Handles all client-side data persistence for Acceptance Criteria Assistant
 * @module storage
 */

/** @type {string} */
const DB_NAME = 'acceptance-criteria-assistant-db';

/** @type {number} */
const DB_VERSION = 1;

/** @type {string} */
const STORE_NAME = 'criteria';

/**
 * Storage class for IndexedDB operations
 */
class Storage {
  /** @type {IDBDatabase | null} */
  db = null;

  /**
     * Initialize the database
     * @returns {Promise<void>}
     */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const target = /** @type {IDBOpenDBRequest} */ (event.target);
        const db = target.result;

        // Proposals store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
          store.createIndex('title', 'title', { unique: false });
          store.createIndex('phase', 'phase', { unique: false });
          store.createIndex('dealershipName', 'dealershipName', { unique: false });
        }

        // Prompts store
        if (!db.objectStoreNames.contains('prompts')) {
          db.createObjectStore('prompts', { keyPath: 'phase' });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Attachments store (for PDF text content)
        if (!db.objectStoreNames.contains('attachments')) {
          const attachStore = db.createObjectStore('attachments', { keyPath: 'id' });
          attachStore.createIndex('proposalId', 'proposalId', { unique: false });
        }
      };
    });
  }

  /**
     * Get all projects sorted by updatedAt descending
     * @returns {Promise<import('./types.js').Project[]>}
     */
  async getAllProjects() {
    const tx = this.db?.transaction(STORE_NAME, 'readonly');
    const store = tx?.objectStore(STORE_NAME);
    const index = store?.index('updatedAt');

    return new Promise((resolve, reject) => {
      if (!index) {
        reject(new Error('Database not initialized'));
        return;
      }
      const request = index.openCursor(null, 'prev');
      /** @type {import('./types.js').Project[]} */
      const projects = [];

      request.onsuccess = (event) => {
        const target = /** @type {IDBRequest<IDBCursorWithValue | null>} */ (event.target);
        const cursor = target.result;
        if (cursor) {
          projects.push(/** @type {import('./types.js').Project} */ (cursor.value));
          cursor.continue();
        } else {
          resolve(projects);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
     * Get a project by ID
     * @param {string} id
     * @returns {Promise<import('./types.js').Project | undefined>}
     */
  async getProject(id) {
    const tx = this.db?.transaction(STORE_NAME, 'readonly');
    const store = tx?.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      if (!store) {
        reject(new Error('Database not initialized'));
        return;
      }
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
     * Save or update a project
     * @param {import('./types.js').Project} project
     * @returns {Promise<import('./types.js').Project>}
     */
  async saveProject(project) {
    project.updatedAt = new Date().toISOString();

    const tx = this.db?.transaction(STORE_NAME, 'readwrite');
    const store = tx?.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      if (!store) {
        reject(new Error('Database not initialized'));
        return;
      }
      const request = store.put(project);
      request.onsuccess = () => resolve(project);
      request.onerror = () => reject(request.error);
    });
  }

  /**
     * Delete a project by ID
     * @param {string} id
     * @returns {Promise<void>}
     */
  async deleteProject(id) {
    const tx = this.db?.transaction(STORE_NAME, 'readwrite');
    const store = tx?.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      if (!store) {
        reject(new Error('Database not initialized'));
        return;
      }
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
     * Get storage estimate
     * @returns {Promise<import('./types.js').StorageEstimate | null>}
     */
  async getStorageEstimate() {
    if (navigator.storage && navigator.storage.estimate) {
      return await navigator.storage.estimate();
    }
    return null;
  }

  /**
     * Get a setting by key
     * @param {string} key
     * @returns {Promise<*>}
     */
  async getSetting(key) {
    const tx = this.db?.transaction('settings', 'readonly');
    const store = tx?.objectStore('settings');

    return new Promise((resolve, reject) => {
      if (!store) {
        reject(new Error('Database not initialized'));
        return;
      }
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  /**
     * Save a setting
     * @param {string} key
     * @param {*} value
     * @returns {Promise<void>}
     */
  async saveSetting(key, value) {
    const tx = this.db?.transaction('settings', 'readwrite');
    const store = tx?.objectStore('settings');

    return new Promise((resolve, reject) => {
      if (!store) {
        reject(new Error('Database not initialized'));
        return;
      }
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Export all projects as JSON backup
   * @returns {Promise<{version: number, exportDate: string, projectCount: number, projects: Array}>}
   */
  async exportAll() {
    const projects = await this.getAllProjects();
    return {
      version: DB_VERSION,
      exportDate: new Date().toISOString(),
      projectCount: projects.length,
      projects: projects
    };
  }

  /**
   * Import projects from JSON backup
   * @param {Object} data - Import data with projects array
   * @returns {Promise<number>} Number of projects imported
   */
  async importAll(data) {
    if (!data.projects || !Array.isArray(data.projects)) {
      throw new Error('Invalid import data');
    }

    const tx = this.db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const project of data.projects) {
      await new Promise((resolve, reject) => {
        const request = store.put(project);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    return data.projects.length;
  }
}

export default new Storage();

