import expo from 'eslint-config-expo/flat.js';

export default [
  ...expo,

  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    rules: {
      // TypeScript Items
      '@typescript-eslint/no-unused-vars': [
        'error', {
          'args': 'all',
          'argsIgnorePattern': '^_',
          'caughtErrors': 'all',
          'caughtErrorsIgnorePattern': '^_',
          'destructuredArrayIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
          'ignoreRestSiblings': true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-member-accessibility': [
        'error', 
        { accessibility: 'explicit', overrides: { constructors: 'no-public' } },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Best Practices
      'eqeqeq': ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-void': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'curly': ['error', 'all'], 

      // Stylistic Rules
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'keyword-spacing': ['error', { before: true, after: true }],
      'max-len': ['warn', { code: 100, ignoreUrls: true, ignoreStrings: true }],

      // React / Expo
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-boolean-value': ['error', 'never'],
    },
    languageOptions: {
  parserOptions: {
    project: './tsconfig.json', // This connects ESLint to your types
    tsconfigRootDir: import.meta.dirname,
  },
},
  },

  {
    // Test Linting
    files: ['tests/**/*.{js,ts}', '**/*.test.{js,ts}'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'max-len': 'off',
      'no-console': 'off',
    },
  },
];