import { isLocalhost, initMockMode, isMockEnabled, getMockResponse } from '../js/ai-mock.js';

describe('AI Mock Module', () => {
  describe('isLocalhost', () => {
    test('should return true for localhost', () => {
      // jsdom sets hostname to 'localhost' by default
      expect(isLocalhost()).toBe(true);
    });
  });

  describe('initMockMode', () => {
    beforeEach(() => {
      localStorage.clear();
      document.body.innerHTML = '';
    });

    // Skip: window.location cannot be redefined in jsdom (non-configurable property)
    // The isLocalhost function is tested via the isLocalhost describe block
    test.skip('should do nothing when not on localhost', () => {
      // This test cannot work in jsdom because window.location is non-configurable
    });

    test('should initialize toggle when elements exist', () => {
      document.body.innerHTML = `
        <div id="aiMockToggle" class="hidden"></div>
        <input type="checkbox" id="mockModeCheckbox" />
      `;

      initMockMode();

      const toggle = document.getElementById('aiMockToggle');
      expect(toggle.classList.contains('hidden')).toBe(false);
    });

    test('should restore previous mock mode state from localStorage', () => {
      localStorage.setItem('ai-mock-mode', 'true');
      document.body.innerHTML = `
        <div id="aiMockToggle" class="hidden"></div>
        <input type="checkbox" id="mockModeCheckbox" />
      `;

      initMockMode();

      const checkbox = document.getElementById('mockModeCheckbox');
      expect(checkbox.checked).toBe(true);
    });

    test('should handle checkbox change event', () => {
      document.body.innerHTML = `
        <div id="aiMockToggle" class="hidden"></div>
        <input type="checkbox" id="mockModeCheckbox" />
      `;

      initMockMode();

      const checkbox = document.getElementById('mockModeCheckbox');
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));

      expect(localStorage.getItem('ai-mock-mode')).toBe('true');
    });
  });

  describe('isMockEnabled', () => {
    beforeEach(() => {
      localStorage.clear();
      document.body.innerHTML = '';
      // Reset mock mode by re-initializing with unchecked checkbox
      document.body.innerHTML = `
        <div id="aiMockToggle" class="hidden"></div>
        <input type="checkbox" id="mockModeCheckbox" />
      `;
      localStorage.removeItem('ai-mock-mode');
      initMockMode();
    });

    test('should return false when mock mode not enabled', () => {
      // Ensure checkbox is unchecked
      const checkbox = document.getElementById('mockModeCheckbox');
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change'));
      expect(isMockEnabled()).toBe(false);
    });

    test('should return true when mock mode is enabled on localhost', () => {
      const checkbox = document.getElementById('mockModeCheckbox');
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));

      expect(isMockEnabled()).toBe(true);
    });
  });

  describe('getMockResponse', () => {
    test('should return Phase 1 response', () => {
      const project = { dealershipName: 'Test Motors' };
      const response = getMockResponse(1, project);

      expect(response).toContain('Phase 1');
      expect(response).toContain('Test Motors');
    });

    test('should return Phase 2 response', () => {
      const project = { dealershipName: 'ABC Dealership' };
      const response = getMockResponse(2, project);

      expect(response).toContain('Phase 2');
      expect(response).toContain('ABC Dealership');
    });

    test('should return Phase 3 response', () => {
      const project = { dealershipName: 'XYZ Auto' };
      const response = getMockResponse(3, project);

      expect(response).toContain('Strategic Proposal');
      expect(response).toContain('XYZ Auto');
    });

    test('should handle missing dealership name', () => {
      const project = {};
      const response = getMockResponse(1, project);

      expect(response).toContain('Test Dealership');
    });

    test('should handle invalid phase', () => {
      const project = { dealershipName: 'Test' };
      const response = getMockResponse(99, project);

      expect(response).toContain('not available');
    });
  });
});
