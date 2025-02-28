import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    environment: 'node',
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
})
