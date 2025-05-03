import { getRequiredUserSession } from '@/lib/auth/auth'
import { DB, HealthCheck, HealthCheckResult } from '@pem/db'
import { cn } from '@pem/ui'
import {
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Tooltip,
} from '@radix-ui/themes'
import { format } from 'date-fns'
import { AlertCircleIcon, CircleCheckIcon } from 'lucide-react'
import Link from 'next/link'

type ResultBlipProps = {
  day: Date
  hasError: boolean
}

function ResultBlip({ day, hasError }: ResultBlipProps) {
  return (
    <Tooltip content={format(day, 'MMMM do')}>
      <div
        className={cn('rounded h-full w-2', {
          'bg-emerald-600': !hasError,
          'bg-red-600': hasError,
        })}
      />
    </Tooltip>
  )
}

function MonitorStatus({ hc }: { hc: DB.HealthCheck }) {
  return (
    <Flex align="center" justify="center" p="1">
      {hc.alarm_state === 'ok' ? (
        <CircleCheckIcon size="20px" className="stroke-emerald-700" />
      ) : (
        <AlertCircleIcon size="20px" />
      )}
    </Flex>
  )
}

type CheckProps = {
  hc: DB.HealthCheck
  results: DB.HealthCheckResult.ListAggregateResult[]
}

function Check({ hc, results }: CheckProps) {
  return (
    <Link href={`/checks/${hc.id}`}>
      <Grid columns="auto 1fr 300px">
        <MonitorStatus hc={hc} />
        <Text>{hc.name || hc.url}</Text>
        <Flex className="gap-[1px]">
          {results.map((result) => (
            <ResultBlip
              key={result.day.toISOString()}
              day={result.day}
              hasError={result.has_error}
            />
          ))}
        </Flex>
      </Grid>
    </Link>
  )
}

export default async function ChecksPage() {
  const session = await getRequiredUserSession()
  const checks = await HealthCheck.list({ user_id: session.id })

  const results: Record<string, DB.HealthCheckResult.ListAggregateResult[]> = {}
  for (const hc of checks) {
    results[hc.id] = await HealthCheckResult.listAggregate(hc.id)
  }

  return (
    <Container>
      <Flex justify="between" align="center">
        <Heading>Monitors</Heading>
        <Button asChild>
          <Link href="/checks/new">Create</Link>
        </Button>
      </Flex>
      <Flex direction="column" gap="2">
        {checks.map((hc) => (
          <Check key={hc.id} hc={hc} results={results[hc.id] || []} />
        ))}
      </Flex>
    </Container>
  )
}
