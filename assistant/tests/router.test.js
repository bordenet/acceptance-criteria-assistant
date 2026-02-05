/**
 * Router Module Tests
 */

import { initRouter, navigateTo, getCurrentRoute } from '../js/router.js';

describe('Router Module', () => {
  test('should export initRouter function', () => {
    expect(initRouter).toBeInstanceOf(Function);
  });

  test('should export navigateTo function', () => {
    expect(navigateTo).toBeInstanceOf(Function);
  });

  test('should export getCurrentRoute function', () => {
    expect(getCurrentRoute).toBeInstanceOf(Function);
  });
});
