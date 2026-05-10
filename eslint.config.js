import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'dist-extension', 'dist-webview']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  // Module isolation: nothing under src/modules/ may reach into host concerns.
  // Modules must depend only on src/modules/* and src/utils/* (and external libs).
  {
    files: ['src/modules/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/store/**', '**/components/**', '**/viewsRegistry*', '**/host/**'],
              message:
                'Modules must be self-contained: no imports from store, components, host, or viewsRegistry. Receive data and params via props instead.',
            },
          ],
        },
      ],
    },
  },
])
