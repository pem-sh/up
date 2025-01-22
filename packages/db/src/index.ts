/* eslint-disable @typescript-eslint/no-namespace */
import { createHealthCheckFactory, DB as HealthCheckDB } from './health-check'
import db from './psql'
import { createUserFactory, DB as UserDB } from './user'

const User = createUserFactory(db)
const HealthCheck = createHealthCheckFactory(db)

export { HealthCheck, User }

namespace DB {
  export type User = UserDB.User
  export type HealthCheck = HealthCheckDB.HealthCheck
}

export type { DB }
