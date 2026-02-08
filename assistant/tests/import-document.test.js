/**
 * Import Document Module Tests
 */

import {
  convertHtmlToMarkdown,
  getImportModalHtml
} from '../../shared/js/import-document.js';

describe('Import Document Module', () => {
  describe('convertHtmlToMarkdown', () => {
    test('should convert simple HTML to plain text when TurndownService is unavailable', () => {
      // TurndownService is not available in test environment
      const html = '<p>Hello World</p>';
      const result = convertHtmlToMarkdown(html);
      expect(result).toBe('Hello World');
    });

    test('should use TurndownService when available', () => {
      // Mock TurndownService
      const mockTurndown = jest.fn().mockReturnValue('# Converted Markdown');
      const mockAddRule = jest.fn();
      global.TurndownService = jest.fn().mockImplementation(() => ({
        turndown: mockTurndown,
        addRule: mockAddRule
      }));

      const html = '<h1>Test</h1>';
      const result = convertHtmlToMarkdown(html);

      expect(global.TurndownService).toHaveBeenCalledWith({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        bulletListMarker: '-'
      });
      expect(mockAddRule).toHaveBeenCalledWith('tables', expect.any(Object));
      expect(mockTurndown).toHaveBeenCalledWith(html);
      expect(result).toBe('# Converted Markdown');

      // Clean up
      delete global.TurndownService;
    });

    test('should handle empty HTML', () => {
      const result = convertHtmlToMarkdown('');
      expect(result).toBe('');
    });

    test('should handle HTML with nested elements', () => {
      const html = '<div><p>Paragraph 1</p><p>Paragraph 2</p></div>';
      const result = convertHtmlToMarkdown(html);
      expect(result).toContain('Paragraph 1');
      expect(result).toContain('Paragraph 2');
    });

    test('should handle HTML with headings', () => {
      const html = '<h1>Title</h1><p>Content</p>';
      const result = convertHtmlToMarkdown(html);
      expect(result).toContain('Title');
      expect(result).toContain('Content');
    });

    test('should handle HTML with lists', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = convertHtmlToMarkdown(html);
      expect(result).toContain('Item 1');
      expect(result).toContain('Item 2');
    });

    test('should handle HTML with bold and italic', () => {
      const html = '<p><strong>Bold</strong> and <em>italic</em></p>';
      const result = convertHtmlToMarkdown(html);
      expect(result).toContain('Bold');
      expect(result).toContain('italic');
    });

    test('should handle HTML with links', () => {
      const html = '<a href="https://example.com">Link text</a>';
      const result = convertHtmlToMarkdown(html);
      expect(result).toContain('Link text');
    });

    test('should handle HTML with tables', () => {
      const html = '<table><tr><td>Cell 1</td><td>Cell 2</td></tr></table>';
      const result = convertHtmlToMarkdown(html);
      expect(result).toContain('Cell 1');
      expect(result).toContain('Cell 2');
    });

    test('should handle HTML with special characters', () => {
      const html = '<p>&amp; &lt; &gt; &quot;</p>';
      const result = convertHtmlToMarkdown(html);
      expect(result).toContain('&');
      expect(result).toContain('<');
      expect(result).toContain('>');
    });

    test('should handle whitespace-only HTML', () => {
      const html = '   <p>   </p>   ';
      const result = convertHtmlToMarkdown(html);
      expect(result.trim()).toBe('');
    });

    test('should handle complex nested structures', () => {
      const html = `
        <div>
          <h2>User Story</h2>
          <p>As a user, I want to import documents</p>
          <h2>Acceptance Criteria</h2>
          <ul>
            <li>Given I have a document</li>
            <li>When I paste it</li>
            <li>Then it should be converted</li>
          </ul>
        </div>
      `;
      const result = convertHtmlToMarkdown(html);
      expect(result).toContain('User Story');
      expect(result).toContain('Acceptance Criteria');
      expect(result).toContain('Given I have a document');
    });
  });

  describe('getImportModalHtml', () => {
    test('should return HTML string', () => {
      const html = getImportModalHtml();
      expect(typeof html).toBe('string');
      expect(html.length).toBeGreaterThan(0);
    });

    test('should contain modal structure', () => {
      const html = getImportModalHtml();
      expect(html).toContain('import-modal');
      expect(html).toContain('import-paste-area');
      expect(html).toContain('import-convert-btn');
    });

    test('should contain close button', () => {
      const html = getImportModalHtml();
      expect(html).toContain('import-modal-close');
    });

    test('should contain preview elements', () => {
      const html = getImportModalHtml();
      expect(html).toContain('import-preview-step');
      expect(html).toContain('import-preview-area');
    });

    test('should contain save button', () => {
      const html = getImportModalHtml();
      expect(html).toContain('import-save-btn');
    });

    test('should contain LLM suggestion section', () => {
      const html = getImportModalHtml();
      expect(html).toContain('import-llm-suggestion');
      expect(html).toContain('import-copy-prompt-btn');
    });

    test('should contain cancel button', () => {
      const html = getImportModalHtml();
      expect(html).toContain('import-cancel-btn');
    });

    test('should reference Acceptance Criteria document type', () => {
      const html = getImportModalHtml();
      expect(html).toContain('Issue AC');
    });

    test('should have proper modal structure for accessibility', () => {
      const html = getImportModalHtml();
      // Check for proper z-index for modal overlay
      expect(html).toContain('z-50');
      // Check for proper background overlay
      expect(html).toContain('bg-black');
      expect(html).toContain('bg-opacity-50');
    });

    test('should have contenteditable paste area', () => {
      const html = getImportModalHtml();
      expect(html).toContain('contenteditable="true"');
    });

    test('should have proper button styling', () => {
      const html = getImportModalHtml();
      // Convert button should be blue
      expect(html).toContain('bg-blue-600');
      // Save button should be green
      expect(html).toContain('bg-green-600');
    });

    test('should have LLM cleanup prompt suggestion', () => {
      const html = getImportModalHtml();
      expect(html).toContain('Claude/ChatGPT');
    });
  });
});

