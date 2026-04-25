import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

const jsxUsesVarsRule = {
  meta: {
    type: 'problem',
  },
  create(context) {
    function markJsxNameAsUsed(node) {
      if (!node) return;

      if (node.type === 'JSXIdentifier') {
        context.sourceCode.markVariableAsUsed(node.name, node);
        return;
      }

      if (node.type === 'JSXMemberExpression') {
        markJsxNameAsUsed(node.object);
      }
    }

    return {
      JSXOpeningElement(node) {
        markJsxNameAsUsed(node.name);
      },
      JSXClosingElement(node) {
        markJsxNameAsUsed(node.name);
      },
    };
  },
};

export default [
  {
    ignores: ['dist'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      local: {
        rules: {
          'jsx-uses-vars': jsxUsesVarsRule,
        },
      },
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'local/jsx-uses-vars': 'error',
      // The app intentionally syncs local modal and transition state from effects.
      'react-hooks/set-state-in-effect': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];
