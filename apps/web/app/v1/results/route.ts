import { HealthCheck, HealthCheckResult } from '@pem/db'
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

  const hc = await HealthCheck.fetch(body.health_check_id)
  if (!hc) {
    return new NextResponse(
      JSON.stringify({ error: 'Health check not found' }),
      {
        status: 404,
      },
    )
  }

  const hcr = await HealthCheckResult.create({
    ...body,
  })

  if (hc.alarm_state === 'ok' && hcr.status_code >= 400) {
    await HealthCheck.update({
      id: hc.id,
      alarm_state: 'alarm',
      updated_by: 'system',
    })
  } else if (hc.alarm_state === 'alarm' && hcr.status_code < 400) {
    await HealthCheck.update({
      id: hc.id,
      alarm_state: 'ok',
      updated_by: 'system',
    })
  }

  return new NextResponse(null, {
    status: 202,
  })
}
