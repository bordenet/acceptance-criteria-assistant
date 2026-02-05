/**
 * AI Mock Module
 * Provides mock AI responses for development and testing
 * @module ai-mock
 */

/** @type {boolean} */
let mockModeEnabled = false;

/**
 * Check if running on localhost
 * @returns {boolean}
 */
export function isLocalhost() {
  return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.startsWith('192.168.');
}

/**
 * Initialize mock mode toggle (localhost only)
 * @returns {void}
 */
export function initMockMode() {
  if (!isLocalhost()) return;

  const toggle = document.getElementById('aiMockToggle');
  const checkbox = /** @type {HTMLInputElement | null} */ (document.getElementById('mockModeCheckbox'));

  if (toggle && checkbox) {
    toggle.classList.remove('hidden');

    // Restore previous state
    mockModeEnabled = localStorage.getItem('ai-mock-mode') === 'true';
    checkbox.checked = mockModeEnabled;

    checkbox.addEventListener('change', (e) => {
      const target = /** @type {HTMLInputElement} */ (e.target);
      mockModeEnabled = target.checked;
      localStorage.setItem('ai-mock-mode', mockModeEnabled.toString());
      console.log(`[AI Mock] Mode ${mockModeEnabled ? 'enabled' : 'disabled'}`);
    });
  }
}

/**
 * Check if mock mode is enabled
 * @returns {boolean}
 */
export function isMockEnabled() {
  return isLocalhost() && mockModeEnabled;
}

/**
 * Generate mock response for a phase
 * @param {import('./types.js').PhaseNumber} phase - Phase number
 * @param {import('./types.js').Project} project - Project data
 * @returns {string} Mock response
 */
export function getMockResponse(phase, project) {
  const dealership = project.dealershipName || 'Test Dealership';

  const mockResponses = {
    1: `# Phase 1 Analysis for ${dealership}

## Market Assessment
Based on the provided information, here is my analysis of the current situation...

### Key Findings
1. **Opportunity Area**: The market shows potential for growth
2. **Challenge**: There are some obstacles to address
3. **Recommendation**: A strategic approach is needed

### Next Steps
- Gather additional market data
- Validate assumptions with stakeholders
- Prepare detailed proposal outline

*This is a mock AI response for development purposes.*`,

    2: `# Phase 2 Strategic Framework

## Proposed Solution for ${dealership}

### Executive Summary
Building on the Phase 1 analysis, here is the strategic framework...

### Implementation Approach
1. **Phase A**: Initial assessment and planning
2. **Phase B**: Resource allocation
3. **Phase C**: Execution and monitoring

### Expected Outcomes
- Improved operational efficiency
- Enhanced customer satisfaction
- Measurable ROI within 6 months

*This is a mock AI response for development purposes.*`,

    3: `# Strategic Proposal: ${dealership}

## Executive Summary
This proposal outlines a comprehensive strategy for ${dealership}...

## Problem Statement
Current challenges that need to be addressed...

## Proposed Solution
Our recommended approach includes...

## Implementation Timeline
| Phase | Timeline | Key Activities |
|-------|----------|----------------|
| 1 | Week 1-2 | Planning |
| 2 | Week 3-6 | Implementation |
| 3 | Week 7-8 | Review |

## Budget Overview
Estimated investment: $XX,XXX

## Conclusion
This strategic proposal provides a clear path forward...

*This is a mock AI response for development purposes.*`
  };

  return mockResponses[phase] || 'Mock response not available for this phase.';
}

