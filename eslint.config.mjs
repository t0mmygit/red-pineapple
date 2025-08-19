import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    {
        files: ['**/*.{ts,mjs}'],
        rules: {
            quotes: ['error', 'single'],
            indent: ['error', 4],
        },
    },
);
