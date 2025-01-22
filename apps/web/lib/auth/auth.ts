import { User } from '@pem/db'
import { compare } from 'bcrypt'
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next'
import {
  getServerSession as getNextAuthServerSession,
  NextAuthOptions,
} from 'next-auth'
import { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { redirect } from 'next/navigation'

export type SessionUser = {
  id: string
  name: string
  email: string
  image: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function session({ session, token }: { session: any; token: JWT }) {
  console.log(`session`, { session, token })
  session.user.id = token.id
  return session
}

export const config = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          type: 'text',
        },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const { email, password } = credentials

        const user = await User.fetch({ email })
        if (!user) {
          throw new Error('User not found')
        }

        const isValid = await compare(password, user.password)
        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        return user
      },
    }),
  ],
  callbacks: {
    session,
    async jwt({ token, user }) {
      console.log(`jwt`, { token, user })
      if (user) token.id = user.id
      return token
    },
  },
} satisfies NextAuthOptions

export const getServerSession = (
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
): Promise<{ user: SessionUser } | null> =>
  getNextAuthServerSession(...args, config)

export async function getRequiredUserSession(
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
): Promise<SessionUser> {
  const session = await getNextAuthServerSession(...args, config)
  console.log('session', session)
  if (!session || !session.user) throw Error('unauthorized')
  return session.user as SessionUser
}

export const unauthorized = (callbackUrl: string): never => {
  const params = new URLSearchParams()
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  callbackUrl && params.set('callbackUrl', callbackUrl)
  redirect(`/login?${params.toString()}`)
}
