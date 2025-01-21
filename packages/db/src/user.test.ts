import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { Database } from './psql'
import { objectDateToString, setup } from './test-utils'
import { createUserFactory, UserFactory } from './user'

let Users: UserFactory
let db: Database

async function seedUser(db: Database) {
  await db.query(`
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
      'user_test123456',
      'Test User',
      'test@example.com',
      'password123',
      '2024-01-01 10:00:00+00',
      'system',
      '2024-01-02 12:00:00+00',
      'system'
    )`)
}

describe('users', () => {
  beforeAll(async () => {
    db = await setup()
    Users = createUserFactory(db)
  })

  beforeEach(async () => {
    db.id = undefined
    return db.query(`TRUNCATE TABLE users`)
  })

  test('create', async () => {
    db.id = () => 'user_1234'
    const created = await Users.create({
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: 'securepass123',
      created_by: 'system',
    })

    expect(objectDateToString(created)).toEqual({
      id: 'user_1234',
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: 'securepass123',
      created_at: '2024-10-31T02:09:08.113Z',
      created_by: 'system',
      updated_at: '2024-10-31T02:09:08.113Z',
      updated_by: 'system',
    })
  })

  test('create - fails with duplicate email', async () => {
    await seedUser(db)

    db.id = () => 'user_1234'
    await expect(
      Users.create({
        name: 'Another User',
        email: 'test@example.com', // Same email as seedUser
        password: 'password456',
        created_by: 'system',
      }),
    ).rejects.toThrow('duplicate key value violates unique constraint')
  })

  test.each([
    {
      name: 'find by id',
      search: { id: 'user_test123456' },
      shouldFind: true,
    },
    {
      name: 'find by email',
      search: { email: 'test@example.com' },
      shouldFind: true,
    },
    {
      name: 'find with no criteria',
      search: {},
      throws: 'Must provide either id or email to fetch user',
    },
    {
      name: 'find non-existent user',
      search: { id: 'nonexistent' },
      shouldFind: false,
    },
  ])('fetch - $name', async ({ search, shouldFind, throws }) => {
    await seedUser(db)

    if (throws) {
      await expect(Users.fetch(search)).rejects.toThrow(throws)
      return
    }

    const user = await Users.fetch(search)

    if (shouldFind) {
      expect(objectDateToString(user as any)).toEqual({
        id: 'user_test123456',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        created_at: '2024-01-01T10:00:00.000Z',
        created_by: 'system',
        updated_at: '2024-01-02T12:00:00.000Z',
        updated_by: 'system',
      })
    } else {
      expect(user).toBeNull()
    }
  })
})
