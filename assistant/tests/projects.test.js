/**
 * Projects Module Tests
 *
 * TEMPLATE: Replace {{PROJECT_TYPE}} with your document type (e.g., "proposal", "jd")
 * TEMPLATE: Replace field names if your project uses different form fields
 */

import { jest } from '@jest/globals';
import {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  updatePhase,
  deleteProject,
  exportProject,
  exportAllProjects,
  importProjects,
  extractTitleFromMarkdown
} from '../../shared/js/projects.js';
import storage from '../../shared/js/storage.js';

describe('Projects Module', () => {
  beforeEach(async () => {
    // Initialize storage and clear all projects for test isolation
    await storage.init();
    const allProjects = await getAllProjects();
    for (const project of allProjects) {
      await deleteProject(project.id);
    }
  });

  // =================================================================
  // Function Export Tests (verify API surface)
  // =================================================================
  describe('API Exports', () => {
    test('should export createProject function', () => {
      expect(createProject).toBeInstanceOf(Function);
    });

    test('should export getAllProjects function', () => {
      expect(getAllProjects).toBeInstanceOf(Function);
    });

    test('should export getProject function', () => {
      expect(getProject).toBeInstanceOf(Function);
    });

    test('should export updateProject function', () => {
      expect(updateProject).toBeInstanceOf(Function);
    });

    test('should export updatePhase function', () => {
      expect(updatePhase).toBeInstanceOf(Function);
    });

    test('should export deleteProject function', () => {
      expect(deleteProject).toBeInstanceOf(Function);
    });

    test('should export exportProject function', () => {
      expect(exportProject).toBeInstanceOf(Function);
    });

    test('should export exportAllProjects function', () => {
      expect(exportAllProjects).toBeInstanceOf(Function);
    });

    test('should export importProjects function', () => {
      expect(importProjects).toBeInstanceOf(Function);
    });
  });

  // =================================================================
  // createProject Tests
  // =================================================================
  describe('createProject', () => {
    test('should create a project with required fields', async () => {
      // TEMPLATE: Adjust formData fields for your project type
      const formData = {
        projectName: 'Test Project',
        problemStatement: 'Test problem',
        context: 'Test context'
      };

      const project = await createProject(formData);

      expect(project.id).toBeTruthy();
      expect(project.title).toBeTruthy();
      expect(project.phase).toBe(1);
      expect(project.createdAt).toBeTruthy();
      expect(project.updatedAt).toBeTruthy();
    });

    test('should initialize phases correctly', async () => {
      const formData = { projectName: 'Test', problemStatement: 'Problem', context: 'Context' };
      const project = await createProject(formData);

      expect(project.phases).toBeTruthy();
      expect(project.phases[1]).toHaveProperty('prompt');
      expect(project.phases[1]).toHaveProperty('response');
      expect(project.phases[1]).toHaveProperty('completed');
    });

    test('should save project to storage', async () => {
      const formData = { projectName: 'Test', problemStatement: 'Problem', context: 'Context' };
      const project = await createProject(formData);
      const retrieved = await storage.getProject(project.id);

      expect(retrieved).toBeTruthy();
      expect(retrieved.id).toBe(project.id);
    });
  });

  // =================================================================
  // getAllProjects / getProject Tests
  // =================================================================
  describe('getAllProjects', () => {
    test('should return empty array when no projects', async () => {
      const projects = await getAllProjects();
      expect(projects).toEqual([]);
    });

    test('should return all created projects', async () => {
      await createProject({ projectName: 'Project 1', problemStatement: 'P1', context: 'C1' });
      await createProject({ projectName: 'Project 2', problemStatement: 'P2', context: 'C2' });

      const projects = await getAllProjects();
      expect(projects.length).toBe(2);
    });
  });

  describe('getProject', () => {
    test('should return project by id', async () => {
      const created = await createProject({ projectName: 'Test', problemStatement: 'P', context: 'C' });
      const retrieved = await getProject(created.id);

      expect(retrieved.id).toBe(created.id);
    });

    test('should return undefined for non-existent id', async () => {
      const retrieved = await getProject('non-existent-id');
      expect(retrieved).toBeUndefined();
    });
  });

  // =================================================================
  // exportAllProjects Tests
  // =================================================================
  describe('exportAllProjects', () => {
    let mockClick;
    let capturedBlob;
    let capturedDownloadName;
    let originalCreateElement;

    beforeEach(() => {
      capturedBlob = null;
      capturedDownloadName = null;
      mockClick = jest.fn();

      // Mock URL.createObjectURL to capture the blob
      global.URL.createObjectURL = jest.fn((blob) => {
        capturedBlob = blob;
        return 'blob:mock-url';
      });
      global.URL.revokeObjectURL = jest.fn();

      // Mock document.createElement to capture download filename
      originalCreateElement = document.createElement.bind(document);
      document.createElement = jest.fn((tag) => {
        if (tag === 'a') {
          const anchor = originalCreateElement('a');
          Object.defineProperty(anchor, 'click', {
            value: mockClick,
            writable: true
          });
          Object.defineProperty(anchor, 'download', {
            get: () => capturedDownloadName,
            set: (val) => { capturedDownloadName = val; }
          });
          return anchor;
        }
        return originalCreateElement(tag);
      });
    });

    afterEach(() => {
      document.createElement = originalCreateElement;
    });

    test('should export all projects as backup JSON', async () => {
      await createProject({ projectName: 'Project 1', problemStatement: 'P1', context: 'C1' });
      await createProject({ projectName: 'Project 2', problemStatement: 'P2', context: 'C2' });

      await exportAllProjects();

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      expect(capturedBlob).toBeTruthy();
      expect(capturedBlob.type).toBe('application/json');

      // Verify backup structure
      const blobText = capturedBlob.parts.join('');
      const backup = JSON.parse(blobText);
      expect(backup.version).toBe('1.0');
      expect(backup.projects).toHaveLength(2);
      expect(backup.projectCount).toBe(2);
      expect(backup.exportedAt).toBeTruthy();
    });

    test('should export empty backup when no projects', async () => {
      await exportAllProjects();

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(capturedBlob).toBeTruthy();

      const blobText = capturedBlob.parts.join('');
      const backup = JSON.parse(blobText);
      expect(backup.projectCount).toBe(0);
      expect(backup.projects).toHaveLength(0);
    });

    test('should use dated filename', async () => {
      await createProject({ projectName: 'Test', problemStatement: 'P', context: 'C' });
      await exportAllProjects();

      // TEMPLATE: Adjust pattern to match your project's backup filename format
      expect(capturedDownloadName).toMatch(/backup-\d{4}-\d{2}-\d{2}\.json$/);
    });
  });

  // =================================================================
  // importProjects Tests
  // =================================================================
  describe('importProjects', () => {
    test('should import backup file format', async () => {
      const backupContent = {
        version: '1.0',
        projects: [
          { id: '1', title: 'Project 1', phase: 1, phases: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '2', title: 'Project 2', phase: 1, phases: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ]
      };

      const file = new File([JSON.stringify(backupContent)], 'backup.json', { type: 'application/json' });

      const imported = await importProjects(file);

      expect(imported).toBe(2);
      const projects = await getAllProjects();
      expect(projects.length).toBe(2);
    });

    test('should import single project format', async () => {
      // AC-specific: single-project import checks for `id && (whatNeedsToBeDone || issueTitle)`
      const projectContent = {
        id: 'single-1',
        issueTitle: 'Add bulk delete feature',
        whatNeedsToBeDone: 'Users need to select and delete multiple items',
        title: 'Add bulk delete feature',
        phase: 1,
        phases: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const file = new File([JSON.stringify(projectContent)], 'project.json', { type: 'application/json' });

      const imported = await importProjects(file);

      expect(imported).toBe(1);
      const project = await getProject('single-1');
      expect(project).toBeTruthy();
    });

    test('should reject invalid file format', async () => {
      const invalidContent = { invalid: 'data' };
      const file = new File([JSON.stringify(invalidContent)], 'invalid.json', { type: 'application/json' });

      await expect(importProjects(file)).rejects.toThrow('Invalid file format');
    });

    test('should reject invalid JSON', async () => {
      const file = new File(['not valid json'], 'invalid.json', { type: 'application/json' });

      await expect(importProjects(file)).rejects.toThrow();
    });

    test('should handle empty backup file', async () => {
      const backup = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        projectCount: 0,
        projects: []
      };

      const file = new File([JSON.stringify(backup)], 'empty-backup.json', { type: 'application/json' });

      const importedCount = await importProjects(file);
      expect(importedCount).toBe(0);
    });
  });

  // =================================================================
  // exportProject (single project export) Tests
  // =================================================================
  describe('exportProject', () => {
    let mockClick;
    let capturedBlob;
    let originalCreateElement;

    beforeEach(() => {
      capturedBlob = null;
      mockClick = jest.fn();

      global.URL.createObjectURL = jest.fn((blob) => {
        capturedBlob = blob;
        return 'blob:mock-url';
      });
      global.URL.revokeObjectURL = jest.fn();

      originalCreateElement = document.createElement.bind(document);
      document.createElement = jest.fn((tag) => {
        if (tag === 'a') {
          const anchor = originalCreateElement('a');
          Object.defineProperty(anchor, 'click', { value: mockClick, writable: true });
          return anchor;
        }
        return originalCreateElement(tag);
      });
    });

    afterEach(() => {
      document.createElement = originalCreateElement;
    });

    test('should export single project', async () => {
      const project = await createProject({ projectName: 'Export Test', problemStatement: 'P', context: 'C' });

      await exportProject(project.id);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(capturedBlob).toBeTruthy();

      const blobText = capturedBlob.parts.join('');
      const exported = JSON.parse(blobText);
      expect(exported.id).toBe(project.id);
    });

    test('should throw for non-existent project', async () => {
      await expect(exportProject('non-existent')).rejects.toThrow('Project not found');
    });
  });

  // =================================================================
  // updatePhase Tests
  // =================================================================
  describe('updatePhase', () => {
    test('should update phase prompt and response', async () => {
      const project = await createProject({ projectName: 'Test', problemStatement: 'P', context: 'C' });

      await updatePhase(project.id, 1, 'Test prompt', 'Test response');

      const updated = await getProject(project.id);
      expect(updated.phases[1].prompt).toBe('Test prompt');
      expect(updated.phases[1].response).toBe('Test response');
    });

    test('should advance phase when completed', async () => {
      const project = await createProject({ projectName: 'Test', problemStatement: 'P', context: 'C' });

      await updatePhase(project.id, 1, 'Prompt', 'Response', { markComplete: true });

      const updated = await getProject(project.id);
      expect(updated.phases[1].completed).toBe(true);
      expect(updated.phase).toBe(2);
    });
  });

  // =================================================================
  // deleteProject Tests
  // =================================================================
  describe('deleteProject', () => {
    test('should delete project from storage', async () => {
      const project = await createProject({ projectName: 'Test', problemStatement: 'P', context: 'C' });

      await deleteProject(project.id);

      const retrieved = await getProject(project.id);
      expect(retrieved).toBeUndefined();
    });
  });

  // =================================================================
  // extractTitleFromMarkdown Tests
  // =================================================================
  describe('extractTitleFromMarkdown', () => {
    test('should return empty string for null input', () => {
      expect(extractTitleFromMarkdown(null)).toBe('');
    });

    test('should return empty string for empty input', () => {
      expect(extractTitleFromMarkdown('')).toBe('');
    });

    test('should extract H1 header', () => {
      const md = '# My Document Title\n\nSome content here.';
      expect(extractTitleFromMarkdown(md)).toBe('My Document Title');
    });

    test('should skip PRESS RELEASE header', () => {
      const md = '# PRESS RELEASE\n\n**Exciting Headline Here**\n\nContent...';
      expect(extractTitleFromMarkdown(md)).toBe('Exciting Headline Here');
    });

    test('should extract bold headline after PRESS RELEASE', () => {
      const md = '# PRESS RELEASE\n**Company Announces New Feature**\n\nDetails follow.';
      expect(extractTitleFromMarkdown(md)).toBe('Company Announces New Feature');
    });

    test('should extract first bold line as fallback', () => {
      const md = 'Some text\n**This Is A Good Headline Title**\n\nMore content.';
      expect(extractTitleFromMarkdown(md)).toBe('This Is A Good Headline Title');
    });

    test('should reject too-short bold text', () => {
      const md = '**Short**\n\nMore content.';
      expect(extractTitleFromMarkdown(md)).toBe('');
    });

    test('should reject bold text ending with period (sentences)', () => {
      const md = '**This is a sentence ending with period.**\n\nMore content.';
      expect(extractTitleFromMarkdown(md)).toBe('');
    });
  });
});
