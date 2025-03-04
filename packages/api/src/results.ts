export type HealthCheckResult = {
  health_check_id: string
  status: string
  status_code: number
  response_time_ms: number
  response_body: string
  response_headers: Record<string, string>
  error?: string
}
