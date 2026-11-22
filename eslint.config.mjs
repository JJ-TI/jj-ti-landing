export default [
  {
    files: ['js/**/*.js', 'tests/**/*.cjs', '*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: Object.fromEntries(['document', 'window', 'FormData', 'URL', 'require', 'process', '__dirname', 'module', 'console'].map(name => [name, 'readonly'])),
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'error',
      'no-unreachable': 'error',
      'no-dupe-keys': 'error',
      'no-constant-condition': 'error',
      'eqeqeq': ['error', 'always'],
    },
  },
];
