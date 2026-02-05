/**
 * Main Application Entry Point
 * Strategic Proposal Generator
 * @module app
 */

import storage from './storage.js';
import { initRouter } from './router.js';
import { loadDefaultPrompts } from './workflow.js';
import { exportAllProjects, importProjects } from './projects.js';
import { showToast, showLoading, hideLoading, formatBytes } from './ui.js';
import { initMockMode } from './ai-mock.js';

/**
 * Initialize the application
 * @returns {Promise<void>}
 */
async function init() {
  try {
    showLoading('Initializing...');

    await storage.init();
    console.log('✓ Storage initialized');

    await loadDefaultPrompts();
    console.log('✓ Prompts loaded');

    initRouter();
    console.log('✓ Router initialized');

    setupGlobalEventListeners();
    console.log('✓ Event listeners attached');

    initMockMode();
    console.log('✓ Mock mode initialized');

    await updateStorageInfo();

    hideLoading();
    console.log('✓ App ready');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    hideLoading();
    showToast('Failed to initialize app. Please refresh the page.', 'error', 5000);
  }
}

/**
 * Set up global event listeners for the app
 * @returns {void}
 */
function setupGlobalEventListeners() {
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Related projects dropdown
  const relatedBtn = document.getElementById('related-projects-btn');
  const relatedMenu = document.getElementById('related-projects-menu');
  relatedBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    relatedMenu?.classList.toggle('hidden');
  });
  document.addEventListener('click', () => {
    relatedMenu?.classList.add('hidden');
  });

  // Export all button
  const exportAllBtn = document.getElementById('export-all-btn');
  if (exportAllBtn) {
    exportAllBtn.addEventListener('click', async () => {
      try {
        await exportAllProjects();
        showToast('All proposals exported successfully!', 'success');
      } catch (error) {
        console.error('Export failed:', error);
        showToast('Failed to export proposals', 'error');
      }
    });
  }

  // Import button
  const importBtn = document.getElementById('import-btn');
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        const file = target.files?.[0];
        if (file) {
          try {
            showLoading('Importing...');
            const count = await importProjects(file);
            hideLoading();
            showToast(`Imported ${count} proposal${count > 1 ? 's' : ''} successfully!`, 'success');
            window.location.hash = '';
          } catch (error) {
            hideLoading();
            console.error('Import failed:', error);
            showToast('Failed to import proposals. Please check the file format.', 'error');
          }
        }
      };
      input.click();
    });
  }

  // Close privacy notice
  const closePrivacyNotice = document.getElementById('close-privacy-notice');
  if (closePrivacyNotice) {
    closePrivacyNotice.addEventListener('click', () => {
      document.getElementById('privacy-notice')?.remove();
      storage.saveSetting('privacy-notice-dismissed', true);
    });
  }

  storage.getSetting('privacy-notice-dismissed').then(dismissed => {
    if (dismissed) {
      document.getElementById('privacy-notice')?.remove();
    }
  });

  // About link
  const aboutLink = document.getElementById('about-link');
  if (aboutLink) {
    aboutLink.addEventListener('click', (e) => {
      e.preventDefault();
      showAboutModal();
    });
  }
}

/**
 * Load theme from localStorage or system preference
 * @returns {void}
 */
function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
}

/**
 * Toggle between light and dark themes
 * @returns {void}
 */
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');

  if (isDark) {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    storage.saveSetting('theme', 'light');
  } else {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    storage.saveSetting('theme', 'dark');
  }
}

/**
 * Update storage info display in footer
 * @returns {Promise<void>}
 */
async function updateStorageInfo() {
  const estimate = await storage.getStorageEstimate();
  const storageInfo = document.getElementById('storage-info');

  if (estimate && storageInfo) {
    const used = formatBytes(estimate.usage || 0);
    const quota = formatBytes(estimate.quota || 0);
    const percent = ((estimate.usage / estimate.quota) * 100).toFixed(1);
    storageInfo.textContent = `Storage: ${used} / ${quota} (${percent}%)`;
  } else if (storageInfo) {
    storageInfo.textContent = 'Storage: Available';
  }
}

/**
 * Show the About modal
 * @returns {void}
 */
function showAboutModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl shadow-xl">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">📋 Strategic Proposal Generator</h3>
            <div class="text-gray-700 dark:text-gray-300 space-y-3 mb-6">
                <p>Generate compelling strategic proposals using AI-assisted adversarial review.</p>
                <p><strong>100% Client-Side:</strong> All your data is stored locally in your browser. Nothing is ever sent to any server.</p>
                <p><strong>Privacy-First:</strong> No tracking, no analytics, no cookies (except preferences).</p>
            </div>
            <div class="flex justify-between items-center">
                <a href="https://github.com/bordenet/strategic-proposal" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">View on GitHub →</a>
                <button type="button" id="close-about-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Close</button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
  modal.querySelector('#close-about-btn')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

loadTheme();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

