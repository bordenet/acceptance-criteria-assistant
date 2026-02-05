/**
 * Project View Tests
 */

import { renderProjectView } from '../js/project-view.js';

describe('ProjectView Module', () => {
  test('should export renderProjectView function', () => {
    expect(renderProjectView).toBeInstanceOf(Function);
  });

  test('renderProjectView should be async', () => {
    expect(renderProjectView.constructor.name).toBe('AsyncFunction');
  });
});
