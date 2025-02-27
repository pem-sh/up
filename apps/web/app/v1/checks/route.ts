import { HealthCheck } from '@pem/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const results = await HealthCheck.list({})
  return NextResponse.json({ results })
}
