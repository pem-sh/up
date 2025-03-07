import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'

const UP_ADMIN_TOKEN = process.env.UP_ADMIN_TOKEN

export default async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/v1')) {
    const token = request.headers.get('X-UP-TOKEN')

    if (token !== UP_ADMIN_TOKEN) {
      return new NextResponse(null, { status: 401 })
    }

    return NextResponse.next()
  }

  // For all other routes, use the normal auth middleware
  const auth = await withAuth({
    pages: {
      signIn: '/login',
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (auth as any)(request)
}

export const config = {
  matcher: ['/((?!api|_next|register|login|.*\\.svg|$).*)'],
}
