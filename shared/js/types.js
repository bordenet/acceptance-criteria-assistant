/**
 * Type Definitions for Acceptance Criteria Assistant
 *
 * This file contains JSDoc type definitions used across the application.
 * Import types using: @type {import('./types.js').TypeName}
 *
 * Domain: Linear.app-native acceptance criteria for software engineering issues
 * Terminology: Issue (not Story), Project (not Epic), Cycle (not Sprint)
 */

// ============================================================================
// Project Types
// ============================================================================

/**
 * @typedef {Object} PhaseData
 * @property {string} prompt - The prompt used for this phase
 * @property {string} response - The AI response for this phase
 * @property {boolean} completed - Whether this phase is complete
 */

/**
 * @typedef {Object} Project
 * @property {string} id - Unique identifier (UUID)
 * @property {string} title - Display title (defaults to issueTitle or first line of whatNeedsToBeDone)
 *
 * Acceptance Criteria specific fields:
 * @property {string} issueTitle - Issue title (optional - user may already have it in Linear)
 * @property {string} whatNeedsToBeDone - Main description of the task in plain language
 * @property {string} relatedContext - Links to PRD, Figma, Slack threads, or other issues
 *
 * Standard workflow fields (keep these):
 * @property {string} phase1_output - Output from phase 1 (Draft AC)
 * @property {string} phase2_output - Output from phase 2 (Adversarial Review)
 * @property {string} phase3_output - Output from phase 3 (Final Synthesis)
 * @property {number} phase - Current phase number (1-3)
 * @property {string} createdAt - ISO timestamp of creation
 * @property {string} updatedAt - ISO timestamp of last update
 * @property {Object.<string, PhaseData>} phases - Phase data by phase number
 */

/**
 * @typedef {Object} ProjectFormData
 * @property {string} [title] - Optional title override
 *
 * Acceptance Criteria form fields:
 * @property {string} [issueTitle] - Issue title (optional)
 * @property {string} [whatNeedsToBeDone] - Main description of the task
 * @property {string} [relatedContext] - Links and additional context
 */

// ============================================================================
// Workflow Types
// ============================================================================

/**
 * @typedef {Object} PhaseConfig
 * @property {number} number - Phase number (1, 2, or 3)
 * @property {string} name - Display name for the phase
 * @property {string} aiModel - AI model to use
 * @property {string} aiUrl - URL to the AI interface
 * @property {string} promptFile - Path to the prompt template file
 * @property {string} description - Description of what this phase does
 * @property {string} icon - Emoji icon for the phase
 * @property {string} color - Color theme for the phase
 */

/**
 * @typedef {Object} WorkflowConfig
 * @property {number} phaseCount - Total number of phases
 * @property {PhaseConfig[]} phases - Array of phase configurations
 */

// ============================================================================
// Storage Types
// ============================================================================

/**
 * @typedef {Object} StorageEstimate
 * @property {number} [quota] - Total quota in bytes
 * @property {number} [usage] - Current usage in bytes
 */

/**
 * @typedef {Object} Setting
 * @property {string} key - Setting key
 * @property {*} value - Setting value
 */

// ============================================================================
// UI Types
// ============================================================================

/**
 * @typedef {'success' | 'error' | 'warning' | 'info'} ToastType
 */

/**
 * @typedef {Object} RouteInfo
 * @property {string} name - Route name ('home', 'new-project', 'project')
 * @property {string} [id] - Project ID for project routes
 */

// ============================================================================
// Attachment Types
// ============================================================================

/**
 * @typedef {Object} Attachment
 * @property {string} id - Unique identifier (UUID)
 * @property {string} issueId - ID of the parent issue
 * @property {string} filename - Original filename
 * @property {string} content - Extracted text content
 * @property {number} size - File size in bytes
 * @property {string} createdAt - ISO timestamp of creation
 */

/**
 * @typedef {Object} ProjectBackup
 * @property {string} version - Backup format version
 * @property {string} exportedAt - ISO timestamp of export
 * @property {number} projectCount - Number of projects in backup
 * @property {Project[]} projects - Array of projects
 */

// Export empty object to make this a module
export {};

