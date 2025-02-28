/* eslint-disable @typescript-eslint/no-namespace */
import { createHealthCheckFactory, DB as HealthCheckDB } from './health-check'
import {
  createHealthCheckResultFactory,
  DB as HealthCheckResultDB,
} from './health-check-result'
import db from './psql'
import { createUserFactory, DB as UserDB } from './user'

const User = createUserFactory(db)
const HealthCheck = createHealthCheckFactory(db)
const HealthCheckResult = createHealthCheckResultFactory(db)

export { HealthCheck, HealthCheckResult, User }

namespace DB {
  export type User = UserDB.User
  export type HealthCheck = HealthCheckDB.HealthCheck
  export type HealthCheckResult = HealthCheckResultDB.HealthCheckResult
}

export type { DB }
