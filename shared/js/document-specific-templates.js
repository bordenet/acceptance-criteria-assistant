/**
 * Document-Specific Templates for Acceptance Criteria
 * Pre-filled content for common acceptance criteria use cases
 * @module document-specific-templates
 */

/**
 * @typedef {Object} ACTemplate
 * @property {string} id - Unique template identifier
 * @property {string} name - Display name
 * @property {string} icon - Emoji icon
 * @property {string} description - Short description
 * @property {string} whatNeedsToBeDone - Pre-filled task description
 * @property {string} relatedContext - Pre-filled related context
 */

/** @type {Record<string, ACTemplate>} */
export const DOCUMENT_TEMPLATES = {
  blank: {
    id: 'blank',
    name: 'Blank',
    icon: '📄',
    description: 'Start from scratch',
    whatNeedsToBeDone: '',
    relatedContext: ''
  },
  featureDelivery: {
    id: 'featureDelivery',
    name: 'Feature Delivery',
    icon: '✅',
    description: 'New feature requirements',
    whatNeedsToBeDone: `As a [user type], I want [feature/capability] so that [benefit].

**Context:**
- [Background on why this is needed]
- [User journey or workflow this fits into]

**Requirements:**
- [Specific requirement 1]
- [Specific requirement 2]
- [Specific requirement 3]

**Edge cases to consider:**
- [Edge case 1]
- [Edge case 2]`,
    relatedContext: 'PRD: [link]\nFigma: [link]\nSlack thread: [link]'
  },
  bugFix: {
    id: 'bugFix',
    name: 'Bug Fix',
    icon: '🐛',
    description: 'Bug fix verification',
    whatNeedsToBeDone: `**Bug:** [Brief description of the issue]

**Steps to reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected behavior:** [What should happen]
**Actual behavior:** [What happens instead]

**Fix requirements:**
- Bug is resolved and original behavior is restored
- No regression in related functionality
- [Any specific fix approach if known]`,
    relatedContext: 'Original ticket: [link]\nError logs: [link]'
  },
  apiEndpoint: {
    id: 'apiEndpoint',
    name: 'API Endpoint',
    icon: '🔗',
    description: 'API integration requirements',
    whatNeedsToBeDone: `**Endpoint:** [METHOD] /api/v1/[resource]

**Purpose:** [What this endpoint does]

**Request:**
- Headers: [required headers]
- Body: [expected payload structure]
- Query params: [if applicable]

**Response:**
- Success (200): [expected response structure]
- Errors: [4xx/5xx error codes and messages]

**Requirements:**
- Rate limiting: [if applicable]
- Authentication: [auth requirements]
- Validation: [input validation rules]`,
    relatedContext: 'API spec: [link]\nOpenAPI schema: [link]'
  },
  uiChange: {
    id: 'uiChange',
    name: 'UI Change',
    icon: '🎨',
    description: 'Visual/UX requirements',
    whatNeedsToBeDone: `**Component:** [Component name or page]

**Change description:** [What needs to change visually/behaviorally]

**Requirements:**
- [Visual requirement 1]
- [Interaction requirement]
- [Responsive behavior]

**Accessibility:**
- Keyboard navigation works
- Screen reader compatible
- [Specific WCAG requirements]

**Platforms:**
- Desktop: [browsers]
- Mobile: [devices/breakpoints]
- Dark mode: [if applicable]`,
    relatedContext: 'Figma designs: [link]\nUI style guide: [link]'
  }
};

/**
 * Get a template by ID
 * @param {string} templateId - The template ID
 * @returns {ACTemplate|null} The template or null if not found
 */
export function getTemplate(templateId) {
  return DOCUMENT_TEMPLATES[templateId] || null;
}

/**
 * Get all templates as an array
 * @returns {ACTemplate[]} Array of all templates
 */
export function getAllTemplates() {
  return Object.values(DOCUMENT_TEMPLATES);
}

