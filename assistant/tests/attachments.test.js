/**
 * Attachments Module Tests
 */

import {
  ATTACHMENT_CONFIG,
  validateFile,
  validateFiles,
  formatFileSize,
  handleFiles,
  resetAttachmentTracking,
  getAttachmentStats
} from '../js/attachments.js';

// Helper to create mock File objects
function createMockFile(name, size, type = 'text/plain') {
  const content = new Array(size).fill('a').join('');
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

describe('Attachments Module', () => {
  beforeEach(() => {
    resetAttachmentTracking();
  });

  describe('ATTACHMENT_CONFIG', () => {
    test('should export ATTACHMENT_CONFIG with required properties', () => {
      expect(ATTACHMENT_CONFIG).toBeDefined();
      expect(ATTACHMENT_CONFIG.maxFileSize).toBeDefined();
      expect(ATTACHMENT_CONFIG.maxTotalSize).toBeDefined();
      expect(ATTACHMENT_CONFIG.maxFileCount).toBeDefined();
      expect(ATTACHMENT_CONFIG.allowedTypes).toBeDefined();
      expect(ATTACHMENT_CONFIG.allowedExtensions).toBeDefined();
    });

    test('should have reasonable file size limits', () => {
      expect(ATTACHMENT_CONFIG.maxFileSize).toBeGreaterThan(0);
      expect(ATTACHMENT_CONFIG.maxTotalSize).toBeGreaterThan(ATTACHMENT_CONFIG.maxFileSize);
    });
  });

  describe('resetAttachmentTracking', () => {
    test('should reset tracking state', () => {
      const file = createMockFile('test.txt', 1000);
      validateFile(file);
      resetAttachmentTracking();
      const stats = getAttachmentStats();
      expect(stats.totalSize).toBe(0);
      expect(stats.fileCount).toBe(0);
    });
  });

  describe('getAttachmentStats', () => {
    test('should return initial stats', () => {
      const stats = getAttachmentStats();
      expect(stats.totalSize).toBe(0);
      expect(stats.fileCount).toBe(0);
      expect(stats.remainingSize).toBe(ATTACHMENT_CONFIG.maxTotalSize);
      expect(stats.remainingCount).toBe(ATTACHMENT_CONFIG.maxFileCount);
    });
  });

  describe('formatFileSize', () => {
    test('should export formatFileSize function', () => {
      expect(formatFileSize).toBeInstanceOf(Function);
    });
  });

  describe('validateFile', () => {
    test('should reject null file', () => {
      const result = validateFile(null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('No file');
    });

    test('should reject undefined file', () => {
      const result = validateFile(undefined);
      expect(result.valid).toBe(false);
    });

    test('should reject file with empty name', () => {
      const file = createMockFile('', 100);
      // Manually set name to empty
      Object.defineProperty(file, 'name', { value: '' });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('no name');
    });

    test('should reject empty file', () => {
      const file = createMockFile('empty.txt', 0);
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    test('should reject file exceeding max size', () => {
      const largeSize = ATTACHMENT_CONFIG.maxFileSize + 1;
      const file = createMockFile('large.txt', largeSize);
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds');
    });

    test('should reject disallowed file extensions', () => {
      const file = createMockFile('script.exe', 100, 'application/octet-stream');
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    test('should accept valid txt file', () => {
      const file = createMockFile('document.txt', 100);
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should accept valid pdf file', () => {
      const file = createMockFile('document.pdf', 100, 'application/pdf');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateFiles', () => {
    test('should return empty arrays for empty input', () => {
      const result = validateFiles([]);
      expect(result.valid).toEqual([]);
      expect(result.invalid).toEqual([]);
    });

    test('should separate valid and invalid files', () => {
      const validFile = createMockFile('good.txt', 100);
      const invalidFile = createMockFile('bad.exe', 100, 'application/octet-stream');
      const result = validateFiles([validFile, invalidFile]);
      expect(result.valid.length).toBe(1);
      expect(result.invalid.length).toBe(1);
      expect(result.invalid[0].error).toContain('not allowed');
    });

    test('should accept multiple valid files', () => {
      const files = [
        createMockFile('doc1.txt', 100),
        createMockFile('doc2.txt', 200),
        createMockFile('doc3.pdf', 300, 'application/pdf')
      ];
      const result = validateFiles(files);
      expect(result.valid.length).toBe(3);
      expect(result.invalid.length).toBe(0);
    });
  });

  describe('handleFiles', () => {
    test('should export handleFiles function', () => {
      expect(handleFiles).toBeInstanceOf(Function);
    });
  });
});
