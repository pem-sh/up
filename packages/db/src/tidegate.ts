import { Database } from './psql'

namespace DB {
  export namespace TideGate {
    export type Create = {
      town: string
      created_by: string
    }

    export type Update = {
      town: string
      updated_by: string
    }
  }

  export type TideGate = {
    id: string
    town: string
  }
}

async function create(
  this: Database,
  input: DB.TideGate.Create,
): Promise<DB.TideGate> {
  const columns = [
    'town',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
  ]
  if (this.id) columns.unshift('id')

  const args = [
    input.town,
    this.createdAt(),
    input.created_by,
    this.updatedAt(),
    input.created_by,
  ]
  if (this.id) args.unshift(this.id())

  const placeholders = [...Array(columns.length)].map((_, i) => `$${i + 1}`)

  const { rows } = await this.query<DB.TideGate>(
    `
    INSERT INTO tidegates (${columns.join(',')})
    VALUES (${placeholders.join(',')})
    RETURNING *
  `,
    args,
  )
  const tidegate = rows[0]
  if (!tidegate) throw new Error(`failed to create tidegate`)

  return tidegate
}

export function createTidegateFactory(db: Database) {
  return {
    create: create.bind(db),
  }
}

export type TidegateFactory = ReturnType<typeof createTidegateFactory>
