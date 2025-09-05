import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname
      },
      ecmaVersion: 2020,
      globals: globals.browser
    },
    settings: {
      'import/resolver': {
        typescript: {}
      }
    },
    rules: {
      'import/order': [
        'error',
        {
          alphabetize: { caseInsensitive: true, order: 'asc' },
          'newlines-between': 'always'
        }
      ]
    }
  }
]);
