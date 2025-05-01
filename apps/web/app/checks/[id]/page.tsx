import { HealthCheck, HealthCheckResult } from '@pem/db'
import { Container, Heading } from '@radix-ui/themes'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
}

export default async function CheckPage({ params }: Props) {
  const { id } = await params
  const check = await HealthCheck.fetch(id)
  const results = await HealthCheckResult.list({ health_check_id: id })

  if (!check) {
    throw notFound()
  }

  return (
    <Container>
      <Heading>{check.name || check.url}</Heading>
    </Container>
  )
}
