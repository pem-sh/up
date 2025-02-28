import { HealthCheckResult } from '@pem/db'
import { NextRequest, NextResponse } from 'next/server'

type RequestBody = {
  health_check_id: string
  status: string
  status_code: number
  response_time_ms: number
  response_body: string
  response_headers: Record<string, string>
  error: string
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RequestBody

  await HealthCheckResult.create({
    ...body,
  })

  return new NextResponse(null, {
    status: 202,
  })
}
