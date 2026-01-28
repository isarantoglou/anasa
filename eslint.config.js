import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'

// Define once for performance (per typescript-eslint docs)
const extraFileExtensions = ['.vue']

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      '.playwright-mcp/**',
    ],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules (type-aware)
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // TypeScript parser options and browser globals
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions,
      },
    },
  },

  // Vue 3 recommended rules
  ...pluginVue.configs['flat/recommended'],

  // Vue files use TypeScript parser (per official eslint-plugin-vue docs)
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions,
      },
    },
  },

  // Project-specific rules
  {
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // Relax strict type rules for practicality
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',

      // Vue (per eslint-plugin-vue docs)
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/define-macros-order': [
        'warn',
        {
          order: ['defineOptions', 'defineModel', 'defineProps', 'defineEmits', 'defineSlots'],
          defineExposeLast: true,
        },
      ],
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/one-component-per-file': 'off',
      'vue/attributes-order': 'off',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'smart'],
    },
  },

  // Relax rules for test files
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },

  // Config files - disable type-aware rules (not in tsconfig)
  {
    files: [
      '*.config.js',
      '*.config.ts',
      'vite.config.ts',
      'vitest.config.ts',
      'playwright.config.ts',
    ],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // E2E tests - disable type-aware rules (not in tsconfig)
  {
    files: ['e2e/**/*.ts'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // Prettier must be last to disable conflicting rules
  eslintConfigPrettier
)
