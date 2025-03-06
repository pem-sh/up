import { API } from '@pem/api'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const API_HOST = process.env.API_HOST || 'http://localhost:3000'
const CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes in milliseconds

async function fetchChecks(): Promise<API.HealthCheck[]> {
  try {
    const response = await axios.get<API.HealthCheckResults>(
      `${API_HOST}/v1/checks`,
    )
    return response.data.results
  } catch (error) {
    console.error('Error fetching checks:', error)
    return []
  }
}

async function performCheck(
  check: API.HealthCheck,
): Promise<API.HealthCheckResult> {
  const startTime = Date.now()

  try {
    const response = await axios({
      method: check.http_method,
      url: check.url,
      headers: check.request_headers ?? {},
      data: check.request_body,
      timeout: 30000,
      maxRedirects: check.follow_redirects ? 5 : 0,
      validateStatus: () => true, // Don't throw on any status code
    })

    const duration = Date.now() - startTime
    const headers = Object.fromEntries(
      Object.entries(response.headers).map(([key, value]) => [
        key,
        value.toString(),
      ]),
    )

    return {
      health_check_id: check.id,
      http: {
        response: {
          status: response.statusText,
          status_code: response.status,
          response_time_ms: duration,
          response_body: response.data,
          response_headers: headers,
        },
      },
    }
  } catch (error) {
    return {
      health_check_id: check.id,
      http: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }
}

async function submitResults(results: API.HealthCheckResult[]): Promise<void> {
  try {
    for (const result of results) {
      await axios.post(`${API_HOST}/v1/results`, result)
    }
  } catch (error) {
    console.error('Error submitting results:', error)
  }
}

async function runChecks(): Promise<void> {
  console.log('Starting check cycle...')
  const checks = await fetchChecks()

  if (checks.length === 0) {
    console.log('No checks found')
    return
  }

  console.log(`Running ${checks.length} checks...`)
  const results = await Promise.all(checks.map(performCheck))

  console.log('Submitting results...')
  await submitResults(results)

  console.log('Check cycle completed')
}

async function startWorker(): Promise<void> {
  console.log('Worker starting...')

  // Run immediately on startup
  await runChecks()

  // Then run on interval
  setInterval(runChecks, CHECK_INTERVAL)
}

// Start the worker
startWorker().catch((error) => {
  console.error('Fatal worker error:', error)
  process.exit(1)
})
