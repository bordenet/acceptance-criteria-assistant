/**
 * Project Management Module for Acceptance Criteria Assistant
 * Handles project CRUD operations
 * @module projects
 *
 * Domain: Linear.app-native acceptance criteria for software engineering issues
 */

import storage from './storage.js';

/**
 * Extract title from final document markdown content
 * @param {string} markdown - Document markdown content
 * @returns {string} Extracted title or empty string
 */
function extractTitleFromMarkdown(markdown) {
  if (!markdown) return '';

  // First try: H1 header (# Title)
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  if (h1Match) {
    const title = h1Match[1].trim();
    // Skip generic headers like "PRESS RELEASE" or "Press Release"
    if (!/^press\s+release$/i.test(title)) {
      return title;
    }
  }

  // Second try: Bold headline after "# PRESS RELEASE" or "## Press Release"
  // Pattern: **Headline Text**
  const prMatch = markdown.match(/^#\s*PRESS\s*RELEASE\s*$/im);
  if (prMatch) {
    const startIdx = markdown.indexOf(prMatch[0]) + prMatch[0].length;
    const afterPR = markdown.slice(startIdx).trim();
    const boldMatch = afterPR.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      return boldMatch[1].trim();
    }
  }

  // Third try: First bold line in the document
  const firstBoldMatch = markdown.match(/\*\*(.+?)\*\*/);
  if (firstBoldMatch) {
    const title = firstBoldMatch[1].trim();
    // Only use if it looks like a headline (not too long, not a sentence)
    if (title.length > 10 && title.length < 150 && !title.endsWith('.')) {
      return title;
    }
  }

  return '';
}

/**
 * @typedef {Object} UpdatePhaseOptions
 * @property {boolean} [skipAutoAdvance] - If true, don't auto-advance to next phase
 */

/**
 * Create a new project (issue AC)
 *
 * @param {import('./types.js').ProjectFormData} formData
 * @returns {Promise<import('./types.js').Project>}
 */
export async function createProject(formData) {
  /** @type {import('./types.js').Project} */
  const project = {
    id: crypto.randomUUID(),
    // Title: prefer issueTitle, fall back to first line of whatNeedsToBeDone
    title: formData.title || formData.issueTitle || 'New Issue',

    // Acceptance Criteria specific fields
    issueTitle: formData.issueTitle || '',
    whatNeedsToBeDone: formData.whatNeedsToBeDone || '',
    relatedContext: formData.relatedContext || '',

    // Phase outputs (keep these)
    phase1_output: '',
    phase2_output: '',
    phase3_output: '',

    // Workflow state (keep these)
    phase: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phases: {
      1: { prompt: '', response: '', completed: false },
      2: { prompt: '', response: '', completed: false },
      3: { prompt: '', response: '', completed: false }
    }
  };

  await storage.saveProject(project);
  return project;
}

/**
 * Get all projects
 * @returns {Promise<import('./types.js').Project[]>}
 */
export async function getAllProjects() {
  return await storage.getAllProjects();
}

/**
 * Get a project by ID
 * @param {string} id
 * @returns {Promise<import('./types.js').Project | undefined>}
 */
export async function getProject(id) {
  return await storage.getProject(id);
}

/**
 * Update a phase with prompt and response
 * @param {string} projectId
 * @param {number} phase
 * @param {string} prompt
 * @param {string} response
 * @param {UpdatePhaseOptions} [options]
 * @returns {Promise<import('./types.js').Project>}
 */
export async function updatePhase(projectId, phase, prompt, response, options = {}) {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error('Project not found');

  project.phases[phase] = {
    prompt: prompt || '',
    response: response || '',
    completed: !!response
  };

  // Store phase output
  const phaseKey = /** @type {'phase1_output' | 'phase2_output' | 'phase3_output'} */ (`phase${phase}_output`);
  project[phaseKey] = response || '';

  // Auto-advance to next phase if current phase is completed (unless skipAutoAdvance is set)
  if (response && phase < 3 && !options.skipAutoAdvance) {
    project.phase = phase + 1;
  }

  // Phase 3: Extract title from final document and update project title
  if (phase === 3 && response) {
    const extractedTitle = extractTitleFromMarkdown(response);
    if (extractedTitle) {
      project.title = extractedTitle;
    }
  }

  project.updatedAt = new Date().toISOString();
  await storage.saveProject(project);
  return project;
}

/**
 * Update project with partial data
 * @param {string} projectId
 * @param {Partial<import('./types.js').Project>} updates
 * @returns {Promise<import('./types.js').Project>}
 */
export async function updateProject(projectId, updates) {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error('Project not found');

  Object.assign(project, updates);
  project.updatedAt = new Date().toISOString();
  await storage.saveProject(project);
  return project;
}

/**
 * Delete a project by ID
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteProject(id) {
  await storage.deleteProject(id);
}

/**
 * Export a single project as JSON file
 * @param {string} projectId
 * @returns {Promise<void>}
 */
export async function exportProject(projectId) {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error('Project not found');

  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `issue-ac-${sanitizeFilename(project.issueTitle || project.title)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export all projects as a backup JSON file
 * @returns {Promise<void>}
 */
export async function exportAllProjects() {
  const projects = await storage.getAllProjects();

  /** @type {import('./types.js').ProjectBackup} */
  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    projectCount: projects.length,
    projects: projects
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ac-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import projects from a JSON file
 * @param {File} file
 * @returns {Promise<number>} Number of projects imported
 */
export async function importProjects(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Failed to read file');
        }
        const content = JSON.parse(result);
        let imported = 0;

        if (content.version && content.projects) {
          for (const project of content.projects) {
            await storage.saveProject(project);
            imported++;
          }
        } else if (content.id && (content.whatNeedsToBeDone || content.issueTitle)) {
          // Validate AC-specific fields
          await storage.saveProject(content);
          imported = 1;
        } else {
          throw new Error('Invalid file format');
        }

        resolve(imported);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Sanitize a filename for safe download
 * @param {string | undefined} filename
 * @returns {string}
 */
function sanitizeFilename(filename) {
  return (filename || 'project')
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .substring(0, 50);
}

