import { API } from '@pem/api'
import { DB } from '@pem/db'

function getError(
  hc: DB.HealthCheck,
  result: API.HealthCheckResult,
): string | undefined {
  if (!result.http) {
    return 'No HTTP response was received'
  }

  if (result.http?.error) {
    return result.http.error
  }

  if (!result.http.response) {
    return 'No HTTP response was received'
  }

  if (!result.http.response.status_code) {
    return 'No status code was received'
  }

  if (
    !hc.follow_redirects &&
    result.http.response.status_code >= 300 &&
    result.http.response.status_code < 400
  ) {
    return 'Redirect was received but follow_redirects is disabled'
  }

  if (
    !hc.accepted_status_codes.includes(result.http.response.status_code + '')
  ) {
    return `Status code '${result.http.response.status_code}' was not in the accepted list: ${hc.accepted_status_codes.join(', ')}`
  }

  return undefined
}

const HealthCheckResultHelper = {
  getError,
}

export default HealthCheckResultHelper
