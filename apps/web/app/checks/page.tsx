import { getRequiredUserSession } from '@/lib/auth/auth'
import { HealthCheck } from '@pem/db'
import { Button, Container, Flex, Heading } from '@radix-ui/themes'
import Link from 'next/link'

export default async function ChecksPage() {
  const session = await getRequiredUserSession()
  const healthChecks = await HealthCheck.list({ user_id: session.id })

  return (
    <Container>
      <Flex justify="between" align="center">
        <Heading>Health Checks</Heading>
        <Button asChild>
          <Link href="/checks/new">Create</Link>
        </Button>
      </Flex>
      {healthChecks.map((hc) => (
        <div key={hc.id}>{hc.url}</div>
      ))}
    </Container>
  )
}
