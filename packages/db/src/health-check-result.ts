/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
import { Database } from './psql'

type Base = {
  health_check_id: string
  status: string
  status_code: number
  response_time_ms: number
  response_body?: string | null
  response_headers?: Record<string, any> | null
  error?: string | null
}

const baseColumns = [
  'health_check_id',
  'status',
  'status_code',
  'response_time_ms',
  'response_body',
  'response_headers',
  'error',
  'created_at',
]

export namespace DB {
  export namespace HealthCheckResult {
    export type Create = {
      health_check_id: string
      status?: string
      status_code?: number
      response_time_ms?: number
      response_body?: string | null
      response_headers?: Record<string, any> | null
      error?: string | null
    }
    export type ListAggregateResult = {
      day: Date
      has_error: boolean
    }
  }

  export type HealthCheckResult = Base & {
    id: string
    created_at: Date
  }
}

async function create(
  this: Database,
  input: DB.HealthCheckResult.Create,
): Promise<DB.HealthCheckResult> {
  const columns = [...baseColumns]

  if (this.id) columns.unshift('id')

  const args = [
    input.health_check_id,
    input.status,
    input.status_code,
    input.response_time_ms,
    input.response_body || null,
    input.response_headers || null,
    input.error || null,
    this.createdAt(),
  ]
  if (this.id) args.unshift(this.id())

  const placeholders = [...Array(columns.length)].map((_, i) => `$${i + 1}`)

  const { rows } = await this.query<DB.HealthCheckResult>(
    `
      INSERT INTO health_check_results (${columns.join(',')})
      VALUES (${placeholders.join(',')})
      RETURNING *
    `,
    args,
  )

  const healthCheckResult = rows[0]
  if (!healthCheckResult)
    throw new Error('Failed to create health check result')
  return healthCheckResult
}

type ListOptions = {
  health_check_id?: string
  limit?: number
}

async function list(
  this: Database,
  opts: ListOptions = {},
): Promise<DB.HealthCheckResult[]> {
  const args = []
  const where: string[] = []

  if (opts.health_check_id) {
    const i = args.push(opts.health_check_id)
    where.push(`health_check_id = $${i}`)
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''
  const limitClause = opts.limit ? `LIMIT ${opts.limit}` : ''

  const { rows } = await this.query<DB.HealthCheckResult>(
    `
      SELECT * 
      FROM health_check_results 
      ${whereClause}
      ORDER BY created_at DESC
      ${limitClause}
    `,
    args,
  )
  return rows
}

async function listAggregate(
  this: Database,
  health_check_id: string,
  timezone: string = 'UTC',
): Promise<DB.HealthCheckResult.ListAggregateResult[]> {
  const { rows } = await this.query<DB.HealthCheckResult.ListAggregateResult>(
    `
      SELECT 
        (DATE_TRUNC('day', created_at AT TIME ZONE $2) AT TIME ZONE $2)::DATE as day,
        BOOL_OR(error IS NOT NULL) as has_error
      FROM health_check_results
      WHERE health_check_id = $1
      GROUP BY DATE_TRUNC('day', created_at AT TIME ZONE $2)
      ORDER BY day DESC
    `,
    [health_check_id, timezone],
  )
  return rows
}

export function createHealthCheckResultFactory(db: Database) {
  return {
    create: create.bind(db),
    list: list.bind(db),
    listAggregate: listAggregate.bind(db),
  }
}

export type HealthCheckResultFactory = ReturnType<
  typeof createHealthCheckResultFactory
>
