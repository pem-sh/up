import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import {
  createHealthCheckResultFactory,
  HealthCheckResultFactory,
} from './health-check-result'
import { Database } from './psql'
import { Seed } from './seed.test'
import { objectDateToString, setup } from './test-utils'

let HealthCheckResults: HealthCheckResultFactory
let db: Database

async function seedHealthCheck(db: Database, id: string) {
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
      'user_test123456',
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
    [id],
  )
}

async function seedHealthCheckResult(
  db: Database,
  id: string,
  healthCheckId: string,
) {
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
      'success',
      200,
      150,
      '{"message": "OK"}',
      '{"Content-Type": "application/json"}',
      NULL,
      '2024-01-01 10:00:00+00'
    )`,
    [id, healthCheckId],
  )
}

describe('health-check-results', () => {
  beforeAll(async () => {
    db = await setup()
    HealthCheckResults = createHealthCheckResultFactory(db)
  })

  beforeEach(async () => {
    db.id = undefined
    await db.query(`TRUNCATE TABLE users CASCADE`)
    await db.query(`TRUNCATE TABLE health_check_results CASCADE`)
    await db.query(`TRUNCATE TABLE health_checks CASCADE`)
    await Seed.user(db)
    await seedHealthCheck(db, 'hc_test123456')
  })

  test('create', async () => {
    db.id = () => 'hcr_1234'
    const created = await HealthCheckResults.create({
      health_check_id: 'hc_test123456',
      status: 'success',
      status_code: 200,
      response_time_ms: 120,
      response_body: '{"data": "test response"}',
      response_headers: { 'Content-Type': 'application/json' },
      error: null,
    })

    expect(created).toEqual({
      id: 'hcr_1234',
      health_check_id: 'hc_test123456',
      status: 'success',
      status_code: 200,
      response_time_ms: 120,
      response_body: '{"data": "test response"}',
      response_headers: { 'Content-Type': 'application/json' },
      error: null,
      created_at: expect.any(Date),
    })
  })

  test('create - with error', async () => {
    db.id = () => 'hcr_1234'
    const created = await HealthCheckResults.create({
      health_check_id: 'hc_test123456',
      status: 'error',
      status_code: 500,
      response_time_ms: 250,
      response_body: null,
      response_headers: null,
      error: 'Internal Server Error',
    })

    expect(objectDateToString(created)).toEqual({
      id: 'hcr_1234',
      health_check_id: 'hc_test123456',
      status: 'error',
      status_code: 500,
      response_time_ms: 250,
      response_body: null,
      response_headers: null,
      error: 'Internal Server Error',
      created_at: expect.any(String),
    })
  })

  test('list - returns empty array when no results exist', async () => {
    const results = await HealthCheckResults.list({
      health_check_id: 'hc_test123456',
    })
    expect(results).toEqual([])
  })

  test('list - returns results for health check', async () => {
    await seedHealthCheckResult(db, 'hcr_test123456', 'hc_test123456')

    const results = await HealthCheckResults.list({
      health_check_id: 'hc_test123456',
    })
    expect(results).toHaveLength(1)
    expect(results).toEqual([
      {
        id: 'hcr_test123456',
        health_check_id: 'hc_test123456',
        status: 'success',
        status_code: 200,
        response_time_ms: 150,
        response_body: '{"message": "OK"}',
        response_headers: { 'Content-Type': 'application/json' },
        error: null,
        created_at: expect.any(Date),
      },
    ])
  })

  test('list - returns all results when no health_check_id specified', async () => {
    await seedHealthCheck(db, 'hc_test123457')
    await seedHealthCheckResult(db, 'hcr_1', 'hc_test123456')
    await seedHealthCheckResult(db, 'hcr_2', 'hc_test123457')

    const results = await HealthCheckResults.list()
    expect(results).toHaveLength(2)
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'hcr_1',
          health_check_id: 'hc_test123456',
        }),
        expect.objectContaining({
          id: 'hcr_2',
          health_check_id: 'hc_test123457',
        }),
      ]),
    )
  })

  test('list - respects limit parameter', async () => {
    await seedHealthCheckResult(db, 'hcr_1', 'hc_test123456')
    await seedHealthCheckResult(db, 'hcr_2', 'hc_test123456')
    await seedHealthCheckResult(db, 'hcr_3', 'hc_test123456')

    const results = await HealthCheckResults.list({
      health_check_id: 'hc_test123456',
      limit: 2,
    })
    expect(results).toHaveLength(2)
  })
})
