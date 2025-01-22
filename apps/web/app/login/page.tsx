'use client'

import {
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Link as RadixLink,
  Text,
  TextField,
} from '@radix-ui/themes'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'

type FormValues = {
  email: string
  password: string
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit = (data: FormValues) => {
    signIn('credentials', {
      email: data.email,
      password: data.password,
      callbackUrl: '/',
    })
  }

  return (
    <Container size="1" height="100vh">
      <Flex
        direction="column"
        gap="4"
        align="center"
        justify="center"
        height="100%"
      >
        <Card style={{ width: '100%', maxWidth: 400 }}>
          <Heading size="8" weight="bold" mb="4" align="center">
            Login
          </Heading>

          <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            <Flex direction="column" gap="3">
              <TextField.Root
                type="email"
                placeholder="Email"
                {...register('email', {
                  required: 'Email is required',
                })}
              />
              {errors.email && (
                <Text color="red" size="2">
                  {errors.email.message}
                </Text>
              )}

              <TextField.Root
                type="password"
                placeholder="Password"
                {...register('password', {
                  required: 'Password is required',
                })}
              />
              {errors.password && (
                <Text color="red" size="2">
                  {errors.password.message}
                </Text>
              )}

              <Button type="submit" size="3">
                Sign In
              </Button>

              <Flex justify="center">
                <Text size="2">
                  Don&apos;t have an account?{' '}
                  <RadixLink href="/register">Register here</RadixLink>
                </Text>
              </Flex>
            </Flex>
          </form>
        </Card>
      </Flex>
    </Container>
  )
}
