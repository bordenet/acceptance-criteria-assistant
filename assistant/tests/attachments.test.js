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

describe('Attachments Module', () => {
  test('should export ATTACHMENT_CONFIG', () => {
    expect(ATTACHMENT_CONFIG).toBeDefined();
    expect(ATTACHMENT_CONFIG.maxFileSize).toBeDefined();
    expect(ATTACHMENT_CONFIG.maxTotalSize).toBeDefined();
    expect(ATTACHMENT_CONFIG.maxFileCount).toBeDefined();
  });

  test('should export validateFile function', () => {
    expect(validateFile).toBeInstanceOf(Function);
  });

  test('should export validateFiles function', () => {
    expect(validateFiles).toBeInstanceOf(Function);
  });

  test('should export formatFileSize function', () => {
    expect(formatFileSize).toBeInstanceOf(Function);
  });

  test('should export handleFiles function', () => {
    expect(handleFiles).toBeInstanceOf(Function);
  });

  test('should export resetAttachmentTracking function', () => {
    expect(resetAttachmentTracking).toBeInstanceOf(Function);
  });

  test('should export getAttachmentStats function', () => {
    expect(getAttachmentStats).toBeInstanceOf(Function);
  });
});
