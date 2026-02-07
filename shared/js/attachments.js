/**
 * Attachments Module
 * Handles file upload validation and processing for Strategic Proposal Generator
 * @module attachments
 */

import { showToast, formatBytes, escapeHtml } from './ui.js';

/**
 * @typedef {Object} AttachmentConfig
 * @property {number} maxFileSize - Maximum file size in bytes
 * @property {number} maxTotalSize - Maximum total size in bytes
 * @property {number} maxFileCount - Maximum number of files
 * @property {string[]} allowedTypes - Allowed MIME types
 * @property {string[]} allowedExtensions - Allowed file extensions
 */

/**
 * @typedef {Object} AttachmentStats
 * @property {number} totalSize - Current total size
 * @property {number} fileCount - Current file count
 * @property {number} remainingSize - Remaining size allowed
 * @property {number} remainingCount - Remaining files allowed
 */

/**
 * @typedef {Object} FileValidationResult
 * @property {boolean} valid - Whether the file is valid
 * @property {string} [error] - Error message if invalid
 */

/**
 * @typedef {Object} FilesValidationResult
 * @property {File[]} valid - Valid files
 * @property {Array<{file: File, error: string}>} invalid - Invalid files with errors
 */

/**
 * @typedef {Object} HandleFilesResult
 * @property {number} processed - Number of files processed
 * @property {string[]} errors - Error messages
 * @property {AttachmentStats} [stats] - Current stats after processing
 */

/** @type {AttachmentConfig} */
export const ATTACHMENT_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB max per file
  maxTotalSize: 50 * 1024 * 1024, // 50MB total
  maxFileCount: 20,
  allowedTypes: ['application/pdf', 'text/plain'],
  allowedExtensions: ['.pdf', '.txt']
};

/** @type {number} */
let totalAttachmentSize = 0;

/** @type {number} */
let attachedFileCount = 0;

/**
 * Reset attachment tracking (called when form is reset or page changes)
 * @returns {void}
 */
export function resetAttachmentTracking() {
  totalAttachmentSize = 0;
  attachedFileCount = 0;
}

/**
 * Get current attachment stats
 * @returns {AttachmentStats}
 */
export function getAttachmentStats() {
  return {
    totalSize: totalAttachmentSize,
    fileCount: attachedFileCount,
    remainingSize: ATTACHMENT_CONFIG.maxTotalSize - totalAttachmentSize,
    remainingCount: ATTACHMENT_CONFIG.maxFileCount - attachedFileCount
  };
}

/**
 * Format file size for display (wrapper around formatBytes for backwards compatibility)
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export function formatFileSize(bytes) {
  return formatBytes(bytes);
}

/**
 * Validate a single file
 * @param {File} file - File to validate
 * @returns {FileValidationResult}
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!file.name || file.name.trim() === '') {
    return { valid: false, error: 'File has no name' };
  }

  if (file.size === 0) {
    return { valid: false, error: `File "${file.name}" is empty` };
  }

  if (file.size > ATTACHMENT_CONFIG.maxFileSize) {
    const maxMB = (ATTACHMENT_CONFIG.maxFileSize / (1024 * 1024)).toFixed(0);
    const fileMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File "${file.name}" (${fileMB}MB) exceeds maximum size of ${maxMB}MB`
    };
  }

  if (totalAttachmentSize + file.size > ATTACHMENT_CONFIG.maxTotalSize) {
    const maxMB = (ATTACHMENT_CONFIG.maxTotalSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Adding "${file.name}" would exceed total attachment limit of ${maxMB}MB`
    };
  }

  if (attachedFileCount >= ATTACHMENT_CONFIG.maxFileCount) {
    return {
      valid: false,
      error: `Maximum of ${ATTACHMENT_CONFIG.maxFileCount} files allowed`
    };
  }

  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!ATTACHMENT_CONFIG.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File type "${extension}" not allowed. Allowed: ${ATTACHMENT_CONFIG.allowedExtensions.join(', ')}`
    };
  }

  if (file.type && !ATTACHMENT_CONFIG.allowedTypes.includes(file.type)) {
    console.warn(`File "${file.name}" has unexpected MIME type: ${file.type}`);
  }

  return { valid: true };
}

/**
 * Validate an array of files
 * @param {FileList | File[]} files - Files to validate
 * @returns {FilesValidationResult}
 */
export function validateFiles(files) {
  const valid = [];
  const invalid = [];

  Array.from(files).forEach(file => {
    const result = validateFile(file);
    if (result.valid) {
      valid.push(file);
    } else {
      invalid.push({ file, error: result.error });
    }
  });

  return { valid, invalid };
}

/**
 * Handle file uploads with validation
 * @param {FileList | File[]} files - Files to process
 * @returns {HandleFilesResult}
 */
export function handleFiles(files) {
  const fileList = document.getElementById('file-list');
  const attachmentText = document.getElementById('attachmentText');

  if (!fileList || !attachmentText) {
    showToast('Error: Form elements not found', 'error');
    return { processed: 0, errors: ['Form elements not found'] };
  }

  const { valid, invalid } = validateFiles(files);
  const errors = [];

  invalid.forEach(({ error }) => {
    errors.push(error);
    showToast(error, 'error');
  });

  valid.forEach(file => {
    totalAttachmentSize += file.size;
    attachedFileCount++;

    const fileItem = document.createElement('div');
    fileItem.className = 'flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'flex items-center gap-2';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'text-sm text-gray-700 dark:text-gray-300';
    nameSpan.textContent = file.name;

    const sizeSpan = document.createElement('span');
    sizeSpan.className = 'text-xs text-gray-500';
    sizeSpan.textContent = `(${formatFileSize(file.size)})`;

    infoDiv.appendChild(nameSpan);
    infoDiv.appendChild(sizeSpan);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-file-btn text-red-500 hover:text-red-700 text-sm';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      totalAttachmentSize -= file.size;
      attachedFileCount--;
      fileItem.remove();
      showToast(`Removed ${escapeHtml(file.name)}`, 'info');
    });

    fileItem.appendChild(infoDiv);
    fileItem.appendChild(removeBtn);
    fileList.appendChild(fileItem);

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const maxTextLength = 500000;
        if (content.length > maxTextLength) {
          const truncated = content.substring(0, maxTextLength);
          attachmentText.value += `\n\n--- ${file.name} (truncated to ${maxTextLength} chars) ---\n${truncated}\n\n[Content truncated...]`;
          showToast(`Text from ${file.name} was truncated due to size`, 'warning');
        } else {
          attachmentText.value += `\n\n--- ${file.name} ---\n${content}`;
        }
      };
      reader.onerror = () => {
        showToast(`Error reading ${file.name}`, 'error');
        errors.push(`Error reading ${file.name}`);
      };
      reader.readAsText(file);
    }
  });

  if (valid.length > 0) {
    const pdfCount = valid.filter(f => f.name.endsWith('.pdf')).length;
    let message = `Added ${valid.length} file(s).`;
    if (pdfCount > 0) {
      message += ` For ${pdfCount} PDF(s), please paste extracted text manually.`;
    }
    showToast(message, 'info');
  }

  return {
    processed: valid.length,
    errors,
    stats: getAttachmentStats()
  };
}

