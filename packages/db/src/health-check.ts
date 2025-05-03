/* eslint-disable @typescript-eslint/no-explicit-any */
import { Database } from './psql'

export namespace DB {
  export namespace HealthCheck {
    export type Create = {
      user_id: string
      name?: string
      url: string
      http_method: string
      request_body?: string
      request_headers?: Record<string, any>
      content_type?: string
      follow_redirects?: boolean
      accepted_status_codes: string[]
      auth_type?: string
      auth?: Record<string, any>
      alarm_state?: 'ok' | 'alarm'
      created_by: string
    }

    export type Update = {
      id: string
      name?: string | null
      url?: string
      http_method?: string
      request_body?: string | null
      request_headers?: Record<string, any> | null
      content_type?: string | null
      follow_redirects?: boolean
      accepted_status_codes?: string[]
      auth_type?: string | null
      auth?: Record<string, any> | null
      alarm_state?: 'ok' | 'alarm'
      updated_by: string
    }
  }

  export type HealthCheck = {
    id: string
    user_id: string
    name: string | null
    url: string
    http_method: string
    request_body: string | null
    request_headers: Record<string, any> | null
    content_type: string | null
    follow_redirects: boolean
    accepted_status_codes: string[]
    auth_type: string | null
    auth: Record<string, any> | null
    alarm_state: 'ok' | 'alarm'
    created_at: Date
    created_by: string
    updated_at: Date
    updated_by: string
  }
}

async function create(
  this: Database,
  input: DB.HealthCheck.Create,
): Promise<DB.HealthCheck> {
  const columns = [
    'user_id',
    'name',
    'url',
    'http_method',
    'request_body',
    'request_headers',
    'content_type',
    'follow_redirects',
    'accepted_status_codes',
    'auth_type',
    'auth',
    'alarm_state',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
  ]
  if (this.id) columns.unshift('id')

  const args = [
    input.user_id,
    input.name || null,
    input.url,
    input.http_method,
    input.request_body || null,
    input.request_headers || null,
    input.content_type || null,
    input.follow_redirects ?? true,
    input.accepted_status_codes,
    input.auth_type || null,
    input.auth || null,
    input.alarm_state || 'ok',
    this.createdAt(),
    input.created_by,
    this.updatedAt(),
    input.created_by,
  ]
  if (this.id) args.unshift(this.id())

  const placeholders = [...Array(columns.length)].map((_, i) => `$${i + 1}`)

  const { rows } = await this.query<DB.HealthCheck>(
    `
      INSERT INTO health_checks (${columns.join(',')})
      VALUES (${placeholders.join(',')})
      RETURNING *
    `,
    args,
  )

  const healthCheck = rows[0]
  if (!healthCheck) throw new Error('Failed to create health check')
  return healthCheck
}

type ListOptions = {
  user_id?: string
}

async function list(
  this: Database,
  opts: ListOptions = {},
): Promise<DB.HealthCheck[]> {
  const args = []
  const where: string[] = []

  if (opts.user_id) {
    const i = args.push(opts.user_id)
    where.push(`user_id = $${i}`)
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join('\n')}` : ''
  const { rows } = await this.query<DB.HealthCheck>(
    `
      SELECT * 
      FROM health_checks 
      ${whereClause}
      ORDER BY created_at DESC
    `,
    args,
  )
  return rows
}

async function update(
  this: Database,
  input: DB.HealthCheck.Update,
): Promise<DB.HealthCheck> {
  const updateFields = ['updated_at', 'updated_by']
  const values: Array<any> = [this.updatedAt(), input.updated_by]

  // Add optional fields if they exist
  if (input.name !== undefined) {
    updateFields.push('name')
    values.push(input.name)
  }
  if (input.url !== undefined) {
    updateFields.push('url')
    values.push(input.url)
  }
  if (input.http_method !== undefined) {
    updateFields.push('http_method')
    values.push(input.http_method)
  }
  if (input.request_body !== undefined) {
    updateFields.push('request_body')
    values.push(input.request_body)
  }
  if (input.request_headers !== undefined) {
    updateFields.push('request_headers')
    values.push(input.request_headers)
  }
  if (input.content_type !== undefined) {
    updateFields.push('content_type')
    values.push(input.content_type)
  }
  if (input.follow_redirects !== undefined) {
    updateFields.push('follow_redirects')
    values.push(input.follow_redirects)
  }
  if (input.accepted_status_codes !== undefined) {
    updateFields.push('accepted_status_codes')
    values.push(input.accepted_status_codes)
  }
  if (input.auth_type !== undefined) {
    updateFields.push('auth_type')
    values.push(input.auth_type)
  }
  if (input.auth !== undefined) {
    updateFields.push('auth')
    values.push(input.auth)
  }
  if (input.alarm_state !== undefined) {
    updateFields.push('alarm_state')
    values.push(input.alarm_state)
  }

  // Add id as the last parameter
  values.push(input.id)

  const setClause = updateFields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(', ')

  const { rows } = await this.query<DB.HealthCheck>(
    `
      UPDATE health_checks
      SET ${setClause}
      WHERE id = $${values.length}
      RETURNING *
    `,
    values,
  )

  const healthCheck = rows[0]
  if (!healthCheck) throw new Error('Failed to update health check')
  return healthCheck
}

async function fetch(
  this: Database,
  id: string,
): Promise<DB.HealthCheck | null> {
  const { rows } = await this.query<DB.HealthCheck>(
    `
      SELECT * 
      FROM health_checks 
      WHERE id = $1
    `,
    [id],
  )

  return rows[0] || null
}

export function createHealthCheckFactory(db: Database) {
  return {
    create: create.bind(db),
    list: list.bind(db),
    update: update.bind(db),
    fetch: fetch.bind(db),
  }
}

export type HealthCheckFactory = ReturnType<typeof createHealthCheckFactory>
