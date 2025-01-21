import { User } from '@pem/db'
import { compare } from 'bcrypt'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'text',
          placeholder: 'user@example.com',
        },
        password: { label: 'Password', type: 'password' },
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
})

export { handler as GET, handler as POST }
