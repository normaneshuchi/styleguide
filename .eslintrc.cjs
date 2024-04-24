module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/strict-type-checked',
        'plugin:react-hooks/recommended',
        // this plugin requires Prettier to work. it is optional but if using it,
        // you will need to run npm install --save-dev eslint-plugin-prettier eslint-config-prettier prettier
        "plugin:prettier/recommended"
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',
    plugins: ['react-refresh'],
    rules: {
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
        ],
        "@typescript-eslint/indent": ["error", 2],
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-explicit-any": "error",
        "unused-imports/no-unused-imports": "error",
        "max-len": ["error", { "code": 80 }],
        "quotes": ["error", "double", { "avoidEscape": true }]
    },
}
