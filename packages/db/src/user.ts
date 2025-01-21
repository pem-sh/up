import { Database } from './psql'

export namespace DB {
  export namespace User {
    export type Create = {
      name: string
      email: string
      password: string
      created_by: string
    }
    export type Update = {
      id: string
      name?: string
      email?: string
      password?: string
      updated_by: string
    }
  }

  export type User = {
    id: string
    name: string
    email: string
    password: string
    created_at: Date
    created_by: string
    updated_at: Date
    updated_by: string
  }
}

async function create(this: Database, input: DB.User.Create): Promise<DB.User> {
  const columns = [
    'name',
    'email',
    'password',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
  ]
  if (this.id) columns.unshift('id')

  const args = [
    input.name,
    input.email,
    input.password,
    this.createdAt(),
    input.created_by,
    this.updatedAt(),
    input.created_by,
  ]
  if (this.id) args.unshift(this.id())

  const placeholders = [...Array(columns.length)].map((_, i) => `$${i + 1}`)

  const { rows } = await this.query<DB.User>(
    `
      INSERT INTO users (${columns.join(',')})
      VALUES (${placeholders.join(',')})
      RETURNING *
    `,
    args,
  )

  const user = rows[0]
  if (!user) throw new Error('Failed to create user')
  return user
}

async function fetch(
  this: Database,
  by: { id?: string; email?: string },
): Promise<DB.User | null> {
  if (!by.id && !by.email) {
    throw new Error('Must provide either id or email to fetch user')
  }

  const condition = by.id ? 'id = $1' : 'email = $1'
  const value = by.id || by.email

  const { rows } = await this.query<DB.User>(
    `
      SELECT *
      FROM users
      WHERE ${condition}
      LIMIT 1
    `,
    [value],
  )

  return rows[0] || null
}

async function update(this: Database, input: DB.User.Update): Promise<DB.User> {
  const updateFields = ['updated_at', 'updated_by']
  const values = [this.updatedAt(), input.updated_by]

  // Add optional fields if they exist
  if (input.name) {
    updateFields.push('name')
    values.push(input.name)
  }
  if (input.email) {
    updateFields.push('email')
    values.push(input.email)
  }
  if (input.password) {
    updateFields.push('password')
    values.push(input.password)
  }

  // Add id as the last parameter
  values.push(input.id)

  const setClause = updateFields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(', ')

  const { rows } = await this.query<DB.User>(
    `
      UPDATE users
      SET ${setClause}
      WHERE id = $${values.length}
      RETURNING *
    `,
    values,
  )

  const user = rows[0]
  if (!user) throw new Error('Failed to update user')
  return user
}

export function createUserFactory(db: Database) {
  return {
    create: create.bind(db),
    fetch: fetch.bind(db),
    update: update.bind(db),
  }
}

export type UserFactory = ReturnType<typeof createUserFactory>
