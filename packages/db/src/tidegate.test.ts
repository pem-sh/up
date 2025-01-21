import { beforeAll, describe, expect, test } from 'vitest'
import { PSQLDatabase } from './psql'
import { setup } from './test-utils'
import { createTidegateFactory, TidegateFactory } from './tidegate'

let Tidegate: TidegateFactory
let db: PSQLDatabase

describe('Tidegate', () => {
  beforeAll(async () => {
    db = await setup()
    Tidegate = createTidegateFactory(db)
  })

  test('create', async () => {
    const tidegate = await Tidegate.create({
      town: 'test',
      created_by: 'test',
      updated_by: 'test',
    })
    expect(tidegate).toEqual({
      id: expect.any(String),
      town: 'test',
      created_at: expect.any(Date),
      created_by: 'test',
      updated_at: expect.any(Date),
      updated_by: 'test',
    })
  })
})
