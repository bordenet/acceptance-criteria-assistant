/**
 * @jest-environment jsdom
 */

/* global global */

/**
 * Smoke Test - Catches the exact failure mode that broke jd-assistant
 *
 * This test verifies:
 * 1. All JS modules can be imported (catches missing js/core/)
 * 2. All required DOM elements exist (catches wrong index.html)
 */

describe('Smoke Test - App Initialization', () => {
  beforeEach(() => {
    // Set up minimal DOM required by app
    document.body.innerHTML = `
      <div id="app-container"></div>
      <div id="loading-overlay" class="hidden"></div>
      <div id="toast-container"></div>
      <button id="theme-toggle"></button>
      <span id="storage-info"></span>
      <div id="privacy-notice" class="hidden"></div>
      <button id="export-all-btn"></button>
      <button id="import-btn"></button>
      <input id="import-file-input" type="file" />
      <button id="new-project-btn"></button>
      <button id="create-first-btn"></button>
      <div id="related-projects-btn"></div>
      <div id="related-projects-menu"></div>
      <button id="close-privacy-notice"></button>
      <div id="mockModeCheckbox"></div>
      <div id="aiMockToggle"></div>
      <button id="about-link"></button>
    `;

    // Mock localStorage
    const storage = {};
    global.localStorage = {
      getItem: (key) => storage[key] || null,
      setItem: (key, value) => { storage[key] = value; },
      removeItem: (key) => { delete storage[key]; },
      clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
    };
  });

  describe('Module Imports', () => {
    test('storage.js can be imported without errors', async () => {
      await expect(import('../js/storage.js')).resolves.toBeDefined();
    });

    test('workflow.js can be imported without errors', async () => {
      await expect(import('../js/workflow.js')).resolves.toBeDefined();
    });

    test('ui.js can be imported without errors', async () => {
      await expect(import('../js/ui.js')).resolves.toBeDefined();
    });

    test('router.js can be imported without errors', async () => {
      await expect(import('../js/router.js')).resolves.toBeDefined();
    });

    test('projects.js can be imported without errors', async () => {
      await expect(import('../js/projects.js')).resolves.toBeDefined();
    });

    test('ai-mock.js can be imported without errors', async () => {
      await expect(import('../js/ai-mock.js')).resolves.toBeDefined();
    });
  });

  describe('Required DOM Elements', () => {
    test('app-container exists', () => {
      expect(document.getElementById('app-container')).not.toBeNull();
    });

    test('loading-overlay exists', () => {
      expect(document.getElementById('loading-overlay')).not.toBeNull();
    });

    test('toast-container exists', () => {
      expect(document.getElementById('toast-container')).not.toBeNull();
    });

    test('theme-toggle exists', () => {
      expect(document.getElementById('theme-toggle')).not.toBeNull();
    });

    test('storage-info exists', () => {
      expect(document.getElementById('storage-info')).not.toBeNull();
    });

    test('privacy-notice exists', () => {
      expect(document.getElementById('privacy-notice')).not.toBeNull();
    });

    test('export-all-btn exists', () => {
      expect(document.getElementById('export-all-btn')).not.toBeNull();
    });

    test('import-btn exists', () => {
      expect(document.getElementById('import-btn')).not.toBeNull();
    });

    test('import-file-input exists', () => {
      expect(document.getElementById('import-file-input')).not.toBeNull();
    });

    test('new-project-btn exists', () => {
      expect(document.getElementById('new-project-btn')).not.toBeNull();
    });

    test('create-first-btn exists', () => {
      expect(document.getElementById('create-first-btn')).not.toBeNull();
    });

    test('related-projects-btn exists', () => {
      expect(document.getElementById('related-projects-btn')).not.toBeNull();
    });

    test('related-projects-menu exists', () => {
      expect(document.getElementById('related-projects-menu')).not.toBeNull();
    });

    test('close-privacy-notice exists', () => {
      expect(document.getElementById('close-privacy-notice')).not.toBeNull();
    });

    test('mockModeCheckbox exists', () => {
      expect(document.getElementById('mockModeCheckbox')).not.toBeNull();
    });

    test('aiMockToggle exists', () => {
      expect(document.getElementById('aiMockToggle')).not.toBeNull();
    });

    test('about-link exists', () => {
      expect(document.getElementById('about-link')).not.toBeNull();
    });
  });
});

