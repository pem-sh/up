import db from './psql'
import type { DB } from './user'
import { createUserFactory } from './user'

const User = createUserFactory(db)

export { User }
export type { DB }
