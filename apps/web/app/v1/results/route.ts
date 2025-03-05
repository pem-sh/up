import { APIError404 } from '@/lib/api/errors'
import HealthCheckResultHelper from '@/lib/check/check'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { API } from '@pem/api'
import { DB, HealthCheck, HealthCheckResult, User } from '@pem/db'
import { NextRequest, NextResponse } from 'next/server'

const ses = new SESClient()

export async function POST(request: NextRequest) {
  const body = (await request.json()) as API.HealthCheckResult

  const hc = await HealthCheck.fetch(body.health_check_id)
  if (!hc) return APIError404('Health check not found')

  const error = HealthCheckResultHelper.getError(hc, body)
  await HealthCheckResult.create({
    health_check_id: hc.id,
    status: body.http?.response?.status,
    status_code: body.http?.response?.status_code,
    response_time_ms: body.http?.response?.response_time_ms,
    response_body: body.http?.response?.response_body,
    response_headers: body.http?.response?.response_headers,
    error,
  })

  if (hc.alarm_state === 'ok' && !!error) {
    await HealthCheck.update({
      id: hc.id,
      alarm_state: 'alarm',
      updated_by: 'system',
    })
    await emailAlarm(hc)
  } else if (hc.alarm_state === 'alarm' && !error) {
    await HealthCheck.update({
      id: hc.id,
      alarm_state: 'ok',
      updated_by: 'system',
    })
    await emailResolved(hc)
  }

  return new NextResponse(null, {
    status: 202,
  })
}

async function emailAlarm(hc: DB.HealthCheck) {
  const user = await User.fetch({ id: hc.user_id })
  if (!user || !user.email) {
    console.error(
      `Cannot send alarm email: user ${hc.user_id} not found or has no email`,
    )
    return
  }

  const siteUrl = hc.url
  const params = {
    Source: 'alerts@up.pem.sh',
    Destination: {
      ToAddresses: [user.email],
    },
    Message: {
      Subject: {
        Data: `🚨 Alert: ${siteUrl} is down`,
        Charset: 'UTF-8',
      },
      Body: {
        Text: {
          Data: `
Hello ${user.name || 'there'},

We've detected that your monitored endpoint ${siteUrl} is currently down or experiencing issues.

Health Check Details:
- URL: ${siteUrl}
- Status: Down
- Time Detected: ${new Date().toISOString()}

Please check your service as soon as possible.

Regards,
Your Monitoring Service
          `,
          Charset: 'UTF-8',
        },
        Html: {
          Data: `
<html>
<body>
  <h2>🚨 Site Down Alert</h2>
  <p>Hello ${user.name || 'there'},</p>
  <p>We've detected that your monitored endpoint <strong>${siteUrl}</strong> is currently down or experiencing issues.</p>
  <h3>Health Check Details:</h3>
  <ul>
    <li><strong>URL:</strong> ${siteUrl}</li>
    <li><strong>Status:</strong> Down</li>
    <li><strong>Time Detected:</strong> ${new Date().toISOString()}</li>
  </ul>
  <p>Please check your service as soon as possible.</p>
  <p>Regards,<br>Your Monitoring Service</p>
</body>
</html>
          `,
          Charset: 'UTF-8',
        },
      },
    },
  }

  try {
    const command = new SendEmailCommand(params)
    await ses.send(command)
    console.log(`Alarm email sent to ${user.email} for ${siteUrl}`)
  } catch (error) {
    console.error('Error sending alarm email:', error)
  }
}

async function emailResolved(hc: DB.HealthCheck) {
  const user = await User.fetch({ id: hc.user_id })
  if (!user || !user.email) {
    console.error(
      `Cannot send resolved email: user ${hc.user_id} not found or has no email`,
    )
    return
  }

  const siteUrl = hc.url
  const params = {
    Source: 'alerts@up.pem.sh',
    Destination: {
      ToAddresses: [user.email],
    },
    Message: {
      Subject: {
        Data: `✅ Resolved: ${siteUrl} is back up`,
        Charset: 'UTF-8',
      },
      Body: {
        Text: {
          Data: `
Hello ${user.name || 'there'},

Good news! Your monitored endpoint ${siteUrl} is back up and running normally.

Health Check Details:
- URL: ${siteUrl}
- Status: Up
- Time Resolved: ${new Date().toISOString()}

No further action is required at this time.

Regards,
Your Monitoring Service
          `,
          Charset: 'UTF-8',
        },
        Html: {
          Data: `
<html>
<body>
  <h2>✅ Site Restored Alert</h2>
  <p>Hello ${user.name || 'there'},</p>
  <p>Good news! Your monitored endpoint <strong>${siteUrl}</strong> is back up and running normally.</p>
  <h3>Health Check Details:</h3>
  <ul>
    <li><strong>URL:</strong> ${siteUrl}</li>
    <li><strong>Status:</strong> Up</li>
    <li><strong>Time Resolved:</strong> ${new Date().toISOString()}</li>
  </ul>
  <p>No further action is required at this time.</p>
  <p>Regards,<br>Your Monitoring Service</p>
</body>
</html>
          `,
          Charset: 'UTF-8',
        },
      },
    },
  }

  try {
    const command = new SendEmailCommand(params)
    await ses.send(command)
    console.log(`Resolved email sent to ${user.email} for ${siteUrl}`)
  } catch (error) {
    console.error('Error sending resolved email:', error)
  }
}
