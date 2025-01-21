import { Pool, QueryResult, QueryResultRow } from 'pg'

export interface Database {
  id?: () => string
  createdAt: () => string
  updatedAt: () => string
  query<R extends QueryResultRow>(
    text: string,
    params: any[] | undefined,
  ): Promise<QueryResult<R>>
}

const connectionString = process.env.DATABASE_URL as string

class PSQLDatabase implements Database {
  public id?: () => string
  public pool?: Pool

  constructor(public uri: string = connectionString) {}

  createdAt = () => `now()`
  updatedAt = () => `now()`

  connect(uri?: string) {
    if (uri) {
      this.uri = uri
    }
    this.pool = new Pool({
      connectionString: this.uri,
      ...(process.env.NODE_ENV === 'production'
        ? {
            ssl: {
              rejectUnauthorized: false,
            },
          }
        : {}),
    })
  }

  end() {
    this.pool?.end()
  }

  query<R extends QueryResultRow>(
    text: string,
    params: any[] | undefined = undefined,
  ) {
    if (!this.pool) this.connect()
    return this.pool!.query<R>(text, params)
  }
}

const db = new PSQLDatabase()
export default db
export { PSQLDatabase }
