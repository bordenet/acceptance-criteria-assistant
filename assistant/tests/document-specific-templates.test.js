/**
 * Tests for document-specific-templates.js module
 *
 * Tests the Acceptance Criteria template definitions and retrieval functions.
 */

import { DOCUMENT_TEMPLATES, getTemplate, getAllTemplates } from '../../shared/js/document-specific-templates.js';

describe('DOCUMENT_TEMPLATES', () => {
  test('should have 5 templates defined', () => {
    expect(Object.keys(DOCUMENT_TEMPLATES)).toHaveLength(5);
  });

  test('should have blank template', () => {
    expect(DOCUMENT_TEMPLATES.blank).toBeDefined();
    expect(DOCUMENT_TEMPLATES.blank.id).toBe('blank');
    expect(DOCUMENT_TEMPLATES.blank.name).toBe('Blank');
    expect(DOCUMENT_TEMPLATES.blank.whatNeedsToBeDone).toBe('');
    expect(DOCUMENT_TEMPLATES.blank.relatedContext).toBe('');
  });

  test('should have featureDelivery template', () => {
    expect(DOCUMENT_TEMPLATES.featureDelivery).toBeDefined();
    expect(DOCUMENT_TEMPLATES.featureDelivery.id).toBe('featureDelivery');
    expect(DOCUMENT_TEMPLATES.featureDelivery.name).toBe('Feature Delivery');
    expect(DOCUMENT_TEMPLATES.featureDelivery.icon).toBe('✅');
  });

  test('should have bugFix template', () => {
    expect(DOCUMENT_TEMPLATES.bugFix).toBeDefined();
    expect(DOCUMENT_TEMPLATES.bugFix.id).toBe('bugFix');
    expect(DOCUMENT_TEMPLATES.bugFix.name).toBe('Bug Fix');
    expect(DOCUMENT_TEMPLATES.bugFix.icon).toBe('🐛');
  });

  test('should have apiEndpoint template', () => {
    expect(DOCUMENT_TEMPLATES.apiEndpoint).toBeDefined();
    expect(DOCUMENT_TEMPLATES.apiEndpoint.id).toBe('apiEndpoint');
    expect(DOCUMENT_TEMPLATES.apiEndpoint.name).toBe('API Endpoint');
    expect(DOCUMENT_TEMPLATES.apiEndpoint.icon).toBe('🔗');
  });

  test('should have uiChange template', () => {
    expect(DOCUMENT_TEMPLATES.uiChange).toBeDefined();
    expect(DOCUMENT_TEMPLATES.uiChange.id).toBe('uiChange');
    expect(DOCUMENT_TEMPLATES.uiChange.name).toBe('UI Change');
    expect(DOCUMENT_TEMPLATES.uiChange.icon).toBe('🎨');
  });

  test('all templates should have required fields', () => {
    const requiredFields = ['id', 'name', 'icon', 'description', 'whatNeedsToBeDone', 'relatedContext'];

    Object.values(DOCUMENT_TEMPLATES).forEach(template => {
      requiredFields.forEach(field => {
        expect(template[field]).toBeDefined();
        expect(typeof template[field]).toBe('string');
      });
    });
  });
});

describe('getTemplate', () => {
  test('should return template by ID', () => {
    const template = getTemplate('blank');
    expect(template).toBe(DOCUMENT_TEMPLATES.blank);
  });

  test('should return featureDelivery template', () => {
    const template = getTemplate('featureDelivery');
    expect(template.name).toBe('Feature Delivery');
  });

  test('should return bugFix template', () => {
    const template = getTemplate('bugFix');
    expect(template.name).toBe('Bug Fix');
  });

  test('should return null for invalid ID', () => {
    expect(getTemplate('nonexistent')).toBeNull();
    expect(getTemplate('')).toBeNull();
    expect(getTemplate(null)).toBeNull();
  });

  test('should return null for undefined', () => {
    expect(getTemplate(undefined)).toBeNull();
  });
});

describe('getAllTemplates', () => {
  test('should return array of all templates', () => {
    const templates = getAllTemplates();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates).toHaveLength(5);
  });

  test('should include all template objects', () => {
    const templates = getAllTemplates();
    const ids = templates.map(t => t.id);
    expect(ids).toContain('blank');
    expect(ids).toContain('featureDelivery');
    expect(ids).toContain('bugFix');
    expect(ids).toContain('apiEndpoint');
    expect(ids).toContain('uiChange');
  });

  test('each template should have name and icon', () => {
    const templates = getAllTemplates();
    templates.forEach(template => {
      expect(template.name).toBeDefined();
      expect(template.icon).toBeDefined();
    });
  });
});

