module.exports = {
  parserOptions: {
    ecmaVersion: 2021,
  },
  extends: ['eslint:recommended', 'prettier'],
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'es5',
        singleQuote: true,
      },
    ],
    'no-useless-escape': 'warn',
  },
  plugins: ['prettier'],
  overrides: [
    {
      files: ['**/*.test.js'],
      env: {
        jest: true,
      },
    },
  ],
};
