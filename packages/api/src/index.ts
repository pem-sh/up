import type { HealthCheck as HC, HealthCheckResults as HCR } from './check.js'
import type { HealthCheckResult as HCResult } from './results.js'

export namespace API {
  export type HealthCheck = HC
  export type HealthCheckResults = HCR

  export type HealthCheckResult = HCResult
}
