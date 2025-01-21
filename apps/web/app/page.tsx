import { HealthCheck } from '@pem/db'
import { Box } from '@radix-ui/themes'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const healthChecks = await HealthCheck.list({ user_id: 'user_1234' })

  return (
    <Box>
      {healthChecks.map((hc) => (
        <div key={hc.id}>{hc.url}</div>
      ))}
    </Box>
  )
}
