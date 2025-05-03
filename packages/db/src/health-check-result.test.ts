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
    await Seed.healthCheck(db, { id: 'hc_test123456' })
  })

  test('create minimal', async () => {
    db.id = () => 'hcr_1234'
    const created = await HealthCheckResults.create({
      health_check_id: 'hc_test123456',
    })

    expect(created).toEqual({
      id: 'hcr_1234',
      health_check_id: 'hc_test123456',
      error: null,
      response_body: null,
      response_headers: null,
      response_time_ms: null,
      status: null,
      status_code: null,
      created_at: expect.any(Date),
    })
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
    await Seed.healthCheckResult(db, {
      id: 'hcr_test123456',
      health_check_id: 'hc_test123456',
    })

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
    await Seed.healthCheck(db, { id: 'hc_test123457' })
    await Seed.healthCheckResult(db, {
      id: 'hcr_1',
      health_check_id: 'hc_test123456',
    })
    await Seed.healthCheckResult(db, {
      id: 'hcr_2',
      health_check_id: 'hc_test123457',
    })

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
    await Seed.healthCheckResult(db, {
      id: 'hcr_1',
      health_check_id: 'hc_test123456',
    })
    await Seed.healthCheckResult(db, {
      id: 'hcr_2',
      health_check_id: 'hc_test123456',
    })
    await Seed.healthCheckResult(db, {
      id: 'hcr_3',
      health_check_id: 'hc_test123456',
    })

    const results = await HealthCheckResults.list({
      health_check_id: 'hc_test123456',
      limit: 2,
    })
    expect(results).toHaveLength(2)
  })

  describe('listAggregate', () => {
    test('returns empty array when no results exist', async () => {
      const results = await HealthCheckResults.listAggregate('hc_test123456')
      expect(results).toEqual([])
    })

    test('aggregates results by day with default timezone', async () => {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      // Add results for today
      await Seed.healthCheckResult(db, {
        id: 'hcr_1',
        health_check_id: 'hc_test123456',
        created_at: today,
        error: null,
      })
      await Seed.healthCheckResult(db, {
        id: 'hcr_2',
        health_check_id: 'hc_test123456',
        created_at: today,
        error: 'Some error',
      })

      // Add result for yesterday
      await Seed.healthCheckResult(db, {
        id: 'hcr_3',
        health_check_id: 'hc_test123456',
        created_at: yesterday,
        error: null,
      })

      const results = await HealthCheckResults.listAggregate('hc_test123456')
      expect(results).toHaveLength(2)

      // Today should have has_error: true because of the error result
      expect(results[0]).toEqual({
        day: expect.any(Date),
        has_error: true,
      })

      // Yesterday should have has_error: false
      expect(results[1]).toEqual({
        day: expect.any(Date),
        has_error: false,
      })
    })

    test('handles custom timezone', async () => {
      const now = new Date()

      await Seed.healthCheckResult(db, {
        id: 'hcr_1',
        health_check_id: 'hc_test123456',
        created_at: now,
        error: null,
      })

      const results = await HealthCheckResults.listAggregate(
        'hc_test123456',
        'America/New_York',
      )
      expect(results).toHaveLength(1)
      expect(results[0]).toEqual({
        day: expect.any(Date),
        has_error: false,
      })
    })

    test('aggregates multiple days correctly', async () => {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const twoDaysAgo = new Date(today)
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      // Add results for each day
      await Seed.healthCheckResult(db, {
        id: 'hcr_1',
        health_check_id: 'hc_test123456',
        created_at: today,
        error: null,
      })
      await Seed.healthCheckResult(db, {
        id: 'hcr_2',
        health_check_id: 'hc_test123456',
        created_at: yesterday,
        error: 'Error occurred',
      })
      await Seed.healthCheckResult(db, {
        id: 'hcr_3',
        health_check_id: 'hc_test123456',
        created_at: twoDaysAgo,
        error: null,
      })

      const results = await HealthCheckResults.listAggregate('hc_test123456')
      expect(results).toHaveLength(3)

      // Results should be ordered by day DESC
      const day0 = results[0]?.day
      const day1 = results[1]?.day
      const day2 = results[2]?.day
      expect(day0).toBeDefined()
      expect(day1).toBeDefined()
      expect(day2).toBeDefined()
      expect(day0!.getTime()).toBeGreaterThan(day1!.getTime())
      expect(day1!.getTime()).toBeGreaterThan(day2!.getTime())

      // Verify error aggregation
      expect(results[0]?.has_error).toBe(false) // Today
      expect(results[1]?.has_error).toBe(true) // Yesterday
      expect(results[2]?.has_error).toBe(false) // Two days ago
    })
  })
})
