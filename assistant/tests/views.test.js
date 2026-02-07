/**
 * Views Module Tests
 */

import { renderProjectsList, renderNewProjectForm } from '../../shared/js/views.js';

describe('Views Module', () => {
  test('should export renderProjectsList function', () => {
    expect(renderProjectsList).toBeInstanceOf(Function);
  });

  test('should export renderNewProjectForm function', () => {
    expect(renderNewProjectForm).toBeInstanceOf(Function);
  });

  test('renderProjectsList should be async', () => {
    expect(renderProjectsList.constructor.name).toBe('AsyncFunction');
  });
});
