import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { PSQLDatabase } from './psql'

export async function setup(): Promise<PSQLDatabase> {
  // Start PostgreSQL container using Testcontainers
  const container = await new PostgreSqlContainer().start()
  const uri = container.getConnectionUri()
  const db = new PSQLDatabase(uri)
  db.connect()
  db.createdAt = () => `2024-10-31T02:09:08.113Z`
  db.updatedAt = () => `2024-10-31T02:09:08.113Z`
  const schemaFile = join(__dirname, '../psql/schema.sql')
  const schema = await readFile(schemaFile, 'utf-8')
  await db.query(schema)
  return db
}

export function objectDateToString(o: object): object {
  const copy: any = {}
  for (const [key, val] of Object.entries(o)) {
    if (val instanceof Date) {
      copy[key] = val.toISOString()
    } else {
      copy[key] = val
    }
  }
  return copy
}
