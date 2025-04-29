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

async function healthCheck(
  db: Database,
  overrides: Partial<DB.HealthCheck> = {},
) {
  const defaults: Record<keyof DB.HealthCheck, unknown> = {
    id: 'health_check_test123456',
    user_id: 'user_test123456',
    name: 'Test Health Check',
    url: 'https://example.com',
    http_method: 'GET',
    request_body: null,
    request_headers: { Accept: 'application/json' },
    content_type: 'application/json',
    follow_redirects: true,
    accepted_status_codes: ['200', '201'],
    auth_type: null,
    auth: null,
    alarm_state: 'ok',
    created_at: new Date('2024-01-01 10:00:00+00'),
    created_by: 'system',
    updated_at: new Date('2024-01-02 12:00:00+00'),
    updated_by: 'system',
  }

  const healthCheck = { ...defaults, ...overrides }

  await db.query(
    `
    INSERT INTO health_checks (
      id,
      user_id,
      name,
      url,
      http_method,
      request_body,
      request_headers,
      content_type,
      follow_redirects,
      accepted_status_codes,
      auth_type,
      auth,
      alarm_state,
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
      $8,
      $9,
      $10,
      $11,
      $12,
      $13,
      $14,
      $15,
      $16,
      $17
    )`,
    [
      healthCheck.id,
      healthCheck.user_id,
      healthCheck.name,
      healthCheck.url,
      healthCheck.http_method,
      healthCheck.request_body,
      healthCheck.request_headers,
      healthCheck.content_type,
      healthCheck.follow_redirects,
      healthCheck.accepted_status_codes,
      healthCheck.auth_type,
      healthCheck.auth,
      healthCheck.alarm_state,
      healthCheck.created_at,
      healthCheck.created_by,
      healthCheck.updated_at,
      healthCheck.updated_by,
    ],
  )
}

async function healthCheckResult(
  db: Database,
  overrides: Partial<DB.HealthCheckResult> = {},
) {
  const defaults: Record<keyof DB.HealthCheckResult, unknown> = {
    id: 'health_check_result_test123456',
    health_check_id: 'health_check_test123456',
    status: 'success',
    status_code: 200,
    response_time_ms: 150,
    response_body: '{"message": "OK"}',
    response_headers: { 'Content-Type': 'application/json' },
    error: null,
    created_at: new Date('2024-01-01 10:00:00+00'),
  }

  const healthCheckResult = { ...defaults, ...overrides }

  await db.query(
    `
    INSERT INTO health_check_results (
      id,
      health_check_id,
      status,
      status_code,
      response_time_ms,
      response_body,
      response_headers,
      error,
      created_at
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9
    )`,
    [
      healthCheckResult.id,
      healthCheckResult.health_check_id,
      healthCheckResult.status,
      healthCheckResult.status_code,
      healthCheckResult.response_time_ms,
      healthCheckResult.response_body,
      healthCheckResult.response_headers,
      healthCheckResult.error,
      healthCheckResult.created_at,
    ],
  )
}

export const Seed = {
  user,
  healthCheck,
  healthCheckResult,
}

test('seed user', async () => {
  const db = await setup()
  const user = await Seed.user(db)
  expect(user).toBeDefined()
})
