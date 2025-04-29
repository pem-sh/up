import { getRequiredUserSession } from '@/lib/auth/auth'
import { DB, HealthCheck, HealthCheckResult } from '@pem/db'
import { cn } from '@pem/ui'
import { Button, Container, Flex, Grid, Heading, Text } from '@radix-ui/themes'
import Link from 'next/link'

type ResultBlipProps = {
  result: DB.HealthCheckResult
}

function ResultBlip({ result }: ResultBlipProps) {
  console.log(result)
  return (
    <div
      className={cn('rounded h-full w-2', {
        'bg-green-500': result.status_code >= 200 && result.status_code < 300,
        'bg-yellow-500': result.status_code >= 300 && result.status_code < 400,
        'bg-red-500': result.status_code >= 400,
      })}
    ></div>
  )
}

type CheckProps = {
  hc: DB.HealthCheck
  results: DB.HealthCheckResult[]
}

function Check({ hc, results }: CheckProps) {
  return (
    <Grid columns="1fr 300px">
      <Text>{hc.name || hc.url}</Text>
      <Flex>
        {results.map((result) => (
          <ResultBlip key={result.id} result={result} />
        ))}
      </Flex>
    </Grid>
  )
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
