export type HealthCheck = {
  id: string
  url: string
  http_method: string
  request_body: string | null
  request_headers: Record<string, any> | null
  content_type: string | null
  follow_redirects: boolean
  accepted_status_codes: string[]
  auth_type: string | null
  auth: Record<string, any> | null
}

export type HealthCheckResults = {
  results: HealthCheck[]
}
