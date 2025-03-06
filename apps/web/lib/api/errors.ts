import { NextResponse } from 'next/server'

function APIError(message: string, status: number) {
  return new NextResponse(JSON.stringify({ error: message }), {
    status,
  })
}

export function APIError404(message: string) {
  return APIError(message, 404)
}

export function APIError500(message: string = 'Internal server error') {
  return APIError(message, 500)
}
