import { API } from '@pem/api'
import { HealthCheck } from '@pem/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse<API.HealthCheckResults>> {
  const results = await HealthCheck.list({})
  return NextResponse.json<API.HealthCheckResults>({ results })
}
