/**
 * Project Detail View Module
 * Handles rendering the proposal workflow view
 * @module project-view
 */

import { getProject } from './projects.js';
import { getPhaseMetadata, getFinalMarkdown, getExportFilename } from './workflow.js';
import { showToast, showDocumentPreviewModal } from './ui.js';
import { navigateTo } from './router.js';
import { preloadPromptTemplates } from './prompts.js';
import { renderPhaseContent } from './project-view-phase.js';
import { attachPhaseEventListeners, setHelpers } from './project-view-events.js';

// Re-export sub-modules for backward compatibility
export { renderPhaseContent } from './project-view-phase.js';
export { attachPhaseEventListeners } from './project-view-events.js';
export { showDiffModal } from './project-view-diff.js';

/**
 * Extract title from markdown content (looks for # Title at the beginning)
 * @param {string | null | undefined} markdown - The markdown content
 * @returns {string | null} - The extracted title or null if not found
 */
export function extractTitleFromMarkdown(markdown) {
  if (!markdown) return null;

  // Look for first H1 heading (# Title)
  const match = markdown.match(/^#\s+(.+?)$/m);
  if (match && match[1]) {
    const title = match[1].trim();
    // Filter out template placeholders (e.g., {Document Title})
    if (title.includes('{') || title.includes('}')) {
      return null;
    }
    return title;
  }
  return null;
}

/**
 * Update phase tab styles to reflect the active phase
 * @param {import('./types.js').PhaseNumber} activePhase - Active phase number
 * @returns {void}
 */
function updatePhaseTabStyles(activePhase) {
  document.querySelectorAll('.phase-tab').forEach(tab => {
    const tabPhase = parseInt(tab.dataset.phase);
    if (tabPhase === activePhase) {
      tab.classList.remove('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-200');
      tab.classList.add('border-b-2', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
    } else {
      tab.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
      tab.classList.add('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-200');
    }
  });
}

// Initialize helpers for the events module to avoid circular imports
setHelpers({
  extractTitleFromMarkdown,
  updatePhaseTabStyles,
  renderProjectView
});

/**
 * Render the project detail view
 * @param {string} projectId - Project ID to render
 * @returns {Promise<void>}
 */
export async function renderProjectView(projectId) {
  // Preload prompt templates to avoid network delay on first clipboard operation
  // Fire-and-forget: don't await, let it run in parallel with project load
  preloadPromptTemplates().catch(() => {});

  const project = await getProject(projectId);

  if (!project) {
    showToast('Proposal not found', 'error');
    navigateTo('home');
    return;
  }

  const container = document.getElementById('app-container');
  container.innerHTML = `
        <div class="mb-6">
            <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center mb-4">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to Proposals
            </button>

            <div class="flex items-start justify-between">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        ${project.dealershipName || project.title}
                    </h2>
                    <p class="text-gray-600 dark:text-gray-400">
                        ${project.dealershipLocation || ''} ${project.storeCount ? `• ${project.storeCount} stores` : ''}
                        ${project.currentVendor ? `• Currently with ${project.currentVendor}` : ''}
                    </p>
                </div>
                ${project.phases && project.phases[3] && project.phases[3].completed ? `
                <button id="export-document-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    📄 Preview & Copy
                </button>
                ` : ''}
            </div>
        </div>

        <!-- Phase Tabs -->
        <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex space-x-1">
                ${[1, 2, 3].map(phaseNum => {
    const meta = getPhaseMetadata(phaseNum);
    const isActive = project.phase === phaseNum;
    const isCompleted = project.phases[phaseNum]?.completed;

    return `
                        <button
                            class="phase-tab px-6 py-3 font-medium transition-colors ${
  isActive
    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
}"
                            data-phase="${phaseNum}"
                        >
                            <span class="mr-2">${meta.icon}</span>
                            Phase ${phaseNum}
                            ${isCompleted ? '<span class="ml-2 text-green-500">✓</span>' : ''}
                        </button>
                    `;
  }).join('')}
            </div>
        </div>

        <!-- Phase Content -->
        <div id="phase-content">
            ${renderPhaseContent(project, project.phase)}
        </div>
    `;

  // Event listeners
  document.getElementById('back-btn').addEventListener('click', () => navigateTo('home'));

  // Export button only exists when phase 3 is complete (Preview & Copy)
  const exportBtn = document.getElementById('export-document-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const markdown = getFinalMarkdown(project);
      if (markdown) {
        showDocumentPreviewModal(markdown, 'Your Proposal is Ready', getExportFilename(project));
      } else {
        showToast('No proposal content to export', 'warning');
      }
    });
  }

  // Phase tabs - re-fetch project to ensure fresh data
  document.querySelectorAll('.phase-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      const targetPhase = parseInt(tab.dataset.phase);

      // Re-fetch project from storage to get fresh data
      const freshProject = await getProject(project.id);

      // Guard: Can only navigate to a phase if all prior phases are complete
      // Phase 1 is always accessible
      if (targetPhase > 1) {
        const priorPhase = targetPhase - 1;
        const priorPhaseComplete = freshProject.phases?.[priorPhase]?.completed;
        if (!priorPhaseComplete) {
          showToast(`Complete Phase ${priorPhase} before proceeding to Phase ${targetPhase}`, 'warning');
          return;
        }
      }

      freshProject.phase = targetPhase;
      updatePhaseTabStyles(targetPhase);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(freshProject, targetPhase);
      attachPhaseEventListeners(freshProject, targetPhase);
    });
  });

  attachPhaseEventListeners(project, project.phase);
}
