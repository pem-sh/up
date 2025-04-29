import { getRequiredUserSession } from '@/lib/auth/auth'
import { DB, HealthCheck, HealthCheckResult } from '@pem/db'
import { Button, Container, Flex, Heading } from '@radix-ui/themes'
import Link from 'next/link'

type CheckProps = {
  hc: DB.HealthCheck
  results: DB.HealthCheckResult[]
}

function Check({ hc, results }: CheckProps) {
  return <div>{hc.url}</div>
}

export default async function ChecksPage() {
  const session = await getRequiredUserSession()
  const checks = await HealthCheck.list({ user_id: session.id })

  const results: Record<string, DB.HealthCheckResult[]> = {}
  for (const hc of checks) {
    results[hc.id] = await HealthCheckResult.list({
      health_check_id: hc.id,
    })
  }

  return (
    <Container>
      <Flex justify="between" align="center">
        <Heading>Health Checks</Heading>
        <Button asChild>
          <Link href="/checks/new">Create</Link>
        </Button>
      </Flex>
      {checks.map((hc) => (
        <Check key={hc.id} hc={hc} results={results[hc.id] || []} />
      ))}
    </Container>
  )
}
