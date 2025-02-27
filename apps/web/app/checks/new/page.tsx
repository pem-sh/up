'use client'

import { Button, Container, Heading, TextField } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { createCheck, type FormValues } from './actions'

export default function CreateCheck() {
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      url: '',
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      await createCheck(data)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container size="4">
      <Heading>Create Website Health Check</Heading>

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField.Root
          {...register('url')}
          placeholder="https://example.com or http://20.35.10.52"
        />
        <Button type="submit">Create</Button>
      </form>
    </Container>
  )
}
