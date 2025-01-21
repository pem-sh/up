'use server'

import { User } from '@pem/db'
import { hash } from 'bcrypt'

export type FormValues = {
  email: string
  password: string
  confirmPassword: string
}

export async function registerUser(data: FormValues) {
  const hashed = await hash(data.password, 12)
  await User.create({
    name: data.email,
    email: data.email,
    password: hashed,
    created_by: 'system',
  })
}
