/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 30000,
  verbose: true,
  transformIgnorePatterns: [
    'node_modules/(?!(cli-testing-library|strip-final-newline|execa|get-stream|human-signals|is-stream|npm-run-path|onetime|mimic-fn|path-key|shebang-command|shebang-regex|cross-spawn|signal-exit)/)',
  ],
};
