'use server'

import { getRequiredUserSession } from '@/lib/auth/auth'
import { HealthCheck } from '@pem/db'

export type FormValues = {
  url: string
}

export async function createCheck(data: FormValues) {
  console.log(data)

  const session = await getRequiredUserSession()

  const hc = await HealthCheck.create({
    user_id: session.id,
    url: data.url,
    http_method: 'GET',
    accepted_status_codes: ['200'],
    created_by: session.id,
  })
  return hc
}
