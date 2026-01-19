const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'convex/_generated'],
  },
  {
    rules: {
      'react/display-name': 'off',
    },
  },
]);
