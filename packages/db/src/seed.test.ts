import { expect, test } from 'vitest'
import { DB } from '.'
import { Database } from './psql'
import { setup } from './test-utils'

async function user(db: Database, overrides: Partial<DB.User> = {}) {
  const defaults: Record<keyof DB.User, unknown> = {
    id: 'user_test123456',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    created_at: new Date('2024-01-01 10:00:00+00'),
    created_by: 'system',
    updated_at: new Date('2024-01-02 12:00:00+00'),
    updated_by: 'system',
  }

  const user = { ...defaults, ...overrides }
  const { rows } = await db.query(
    `
    INSERT INTO users (
      id,
      name,
      email,
      password,
      created_at,
      created_by,
      updated_at,
      updated_by
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8
    ) RETURNING id`,
    [
      user.id,
      user.name,
      user.email,
      user.password,
      user.created_at,
      user.created_by,
      user.updated_at,
      user.updated_by,
    ],
  )
  return rows[0]?.id
}

export const Seed = {
  user,
}

test('seed user', async () => {
  const db = await setup()
  const user = await Seed.user(db)
  expect(user).toBeDefined()
})
