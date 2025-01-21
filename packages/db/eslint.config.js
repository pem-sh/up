import { config } from '@pem/eslint-config/base'

/** @type {import("eslint").Linter.Config} */
export default [
  {
    '@typescript-eslint/no-namespace': 'off',
  },
  ...config,
]
