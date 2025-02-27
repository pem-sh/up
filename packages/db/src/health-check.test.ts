import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { createHealthCheckFactory, HealthCheckFactory } from './health-check'
import { Database } from './psql'
import { objectDateToString, setup } from './test-utils'
import { DB } from './user'

let HealthChecks: HealthCheckFactory
let db: Database
let userId: string

async function seedUser(db: Database, overrides: Partial<DB.User> = {}) {
  const { rows } = await db.query(`
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
      ${overrides.id ? `'${overrides.id}'` : "'user_test123456'"},
      ${overrides.name ? `'${overrides.name}'` : "'Test User'"},
      ${overrides.email ? `'${overrides.email}'` : "'test@example.com'"},
      ${overrides.password ? `'${overrides.password}'` : "'password123'"},
      ${overrides.created_at ? `'${overrides.created_at}'` : "'2024-01-01 10:00:00+00'"},
      ${overrides.created_by ? `'${overrides.created_by}'` : "'system'"},
      ${overrides.updated_at ? `'${overrides.updated_at}'` : "'2024-01-02 12:00:00+00'"},
      ${overrides.updated_by ? `'${overrides.updated_by}'` : "'system'"}
    ) RETURNING id`)
  return rows[0]?.id
}

async function seedHealthCheck(db: Database, id: string, userId: string) {
  await db.query(
    `
    INSERT INTO health_checks (
      id,
      user_id,
      url,
      http_method,
      request_body,
      request_headers,
      content_type,
      follow_redirects,
      accepted_status_codes,
      auth_type,
      auth,
      created_at,
      created_by,
      updated_at,
      updated_by
    ) VALUES (
      $1,
      $2,
      'https://example.com',
      'GET',
      NULL,
      '{"Accept": "application/json"}',
      'application/json',
      true,
      ARRAY['200', '201'],
      NULL,
      NULL,
      '2024-01-01 10:00:00+00',
      'system',
      '2024-01-02 12:00:00+00',
      'system'
    )`,
    [id, userId],
  )
}

describe('health-checks', () => {
  beforeAll(async () => {
    db = await setup()
    HealthChecks = createHealthCheckFactory(db)
    userId = await seedUser(db)
  })

  beforeEach(async () => {
    db.id = undefined
    await db.query(`TRUNCATE TABLE health_checks CASCADE`)
  })

  test('create', async () => {
    db.id = () => 'hc_1234'
    const created = await HealthChecks.create({
      user_id: userId,
      url: 'https://api.example.com',
      http_method: 'POST',
      request_body: '{"key": "value"}',
      request_headers: { 'Content-Type': 'application/json' },
      content_type: 'application/json',
      follow_redirects: false,
      accepted_status_codes: ['200', '201', '204'],
      auth_type: 'bearer',
      auth: { token: 'secret123' },
      created_by: 'system',
    })

    expect(created).toEqual({
      id: 'hc_1234',
      user_id: userId,
      url: 'https://api.example.com',
      http_method: 'POST',
      request_body: '{"key": "value"}',
      request_headers: { 'Content-Type': 'application/json' },
      content_type: 'application/json',
      follow_redirects: false,
      accepted_status_codes: ['200', '201', '204'],
      auth_type: 'bearer',
      auth: { token: 'secret123' },
      created_at: expect.any(Date),
      created_by: 'system',
      updated_at: expect.any(Date),
      updated_by: 'system',
    })
  })

  test('create - minimal fields', async () => {
    db.id = () => 'hc_1234'
    const created = await HealthChecks.create({
      user_id: userId,
      url: 'https://api.example.com',
      http_method: 'GET',
      accepted_status_codes: ['200'],
      created_by: 'system',
    })

    expect(objectDateToString(created)).toEqual({
      id: 'hc_1234',
      user_id: userId,
      url: 'https://api.example.com',
      http_method: 'GET',
      request_body: null,
      request_headers: null,
      content_type: null,
      follow_redirects: true,
      accepted_status_codes: ['200'],
      auth_type: null,
      auth: null,
      created_at: expect.any(String),
      created_by: 'system',
      updated_at: expect.any(String),
      updated_by: 'system',
    })
  })

  test('list - returns empty array when no health checks exist', async () => {
    const healthChecks = await HealthChecks.list({ user_id: userId })
    expect(healthChecks).toEqual([])
  })

  test('list - returns health checks for user', async () => {
    await seedHealthCheck(db, 'hc_test123456', userId)

    const healthChecks = await HealthChecks.list({ user_id: userId })
    expect(healthChecks).toHaveLength(1)
    expect(healthChecks).toEqual([
      {
        id: 'hc_test123456',
        user_id: userId,
        url: 'https://example.com',
        http_method: 'GET',
        request_body: null,
        request_headers: { Accept: 'application/json' },
        content_type: 'application/json',
        follow_redirects: true,
        accepted_status_codes: ['200', '201'],
        auth_type: null,
        auth: null,
        created_at: expect.any(Date),
        created_by: 'system',
        updated_at: expect.any(Date),
        updated_by: 'system',
      },
    ])
  })

  test('list - returns all health checks when no user_id specified', async () => {
    const otherUserId = await seedUser(db, {
      id: 'user_test123457',
      email: 'test2@example.com',
    })

    await seedHealthCheck(db, 'hc_1', userId)
    await seedHealthCheck(db, 'hc_2', otherUserId)

    const healthChecks = await HealthChecks.list()
    expect(healthChecks).toHaveLength(2)
    expect(healthChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          user_id: userId,
          url: 'https://example.com',
        }),
        expect.objectContaining({
          user_id: otherUserId,
          url: 'https://example.com',
        }),
      ]),
    )
  })

  test.each([
    {
      name: 'update url only',
      update: { url: 'https://new.example.com' },
      expected: {
        url: 'https://new.example.com',
        http_method: 'GET',
      },
    },
    {
      name: 'update http_method only',
      update: { http_method: 'POST' },
      expected: {
        url: 'https://example.com',
        http_method: 'POST',
      },
    },
    {
      name: 'update multiple fields',
      update: {
        url: 'https://new.example.com',
        http_method: 'POST',
        request_body: '{"test": true}',
        request_headers: { 'X-Test': 'true' },
        content_type: 'application/json',
        follow_redirects: false,
        accepted_status_codes: ['200'],
        auth_type: 'basic',
        auth: { username: 'test', password: 'pass' },
      },
      expected: {
        url: 'https://new.example.com',
        http_method: 'POST',
        request_body: '{"test": true}',
        request_headers: { 'X-Test': 'true' },
        content_type: 'application/json',
        follow_redirects: false,
        accepted_status_codes: ['200'],
        auth_type: 'basic',
        auth: { username: 'test', password: 'pass' },
      },
    },
  ])('update - $name', async ({ update, expected }) => {
    await seedHealthCheck(db, 'hc_test123456', userId)

    const updated = await HealthChecks.update({
      id: 'hc_test123456',
      ...update,
      updated_by: 'test_system',
    })

    expect(objectDateToString(updated)).toMatchObject({
      id: 'hc_test123456',
      user_id: userId,
      ...expected,
      updated_at: expect.any(String),
      updated_by: 'test_system',
    })
  })

  test('update - fails with non-existent health check', async () => {
    await expect(
      HealthChecks.update({
        id: 'nonexistent_hc',
        url: 'https://new.example.com',
        updated_by: 'test_system',
      }),
    ).rejects.toThrow('Failed to update health check')
  })
})
