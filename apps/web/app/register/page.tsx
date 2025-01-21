'use client'

import {
  Button,
  Card,
  Container,
  Flex,
  Heading,
  TextField,
} from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { FormValues, registerUser } from './actions'

export default function Register() {
  const { register, handleSubmit } = useForm<FormValues>()

  const onSubmit = async (data: FormValues) => {
    try {
      await registerUser(data)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container size="1" height="100vh">
      <Flex height="100%" justify="center" align="center">
        <Card style={{ width: '100%', maxWidth: 400 }}>
          <Flex direction="column" gap="4">
            <Heading align="center" size="6">
              Up
            </Heading>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Flex direction="column" gap="3">
                <TextField.Root
                  type="email"
                  placeholder="Email"
                  {...register('email', { required: true })}
                />

                <TextField.Root
                  type="password"
                  placeholder="Password"
                  {...register('password', { required: true })}
                />

                <TextField.Root
                  type="password"
                  placeholder="Confirm Password"
                  {...register('confirmPassword', { required: true })}
                />

                <Button type="submit" size="3">
                  Register
                </Button>
              </Flex>
            </form>
          </Flex>
        </Card>
      </Flex>
    </Container>
  )
}
