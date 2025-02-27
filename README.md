# up.pem.sh

Uptime tracker for devs.

## Development

```bash
make run
```

## To Do

- [x] Users
- [x] Auth
- [ ] Checks CRUD
- [ ] Notifications (email)

## Future

- [ ] Checks API
- [ ] Checks CLI
- [ ] Checks

# Checks

## Website Health Check

- Domain
  - Top Level Domain
- DNS
  - Hostname
- Ping
  - Hostname
- TLS
  - Hostname
- HTTP

  - URL
  - HTTP Method (GET, POST, etc.)
  - Request Body
  - Request Headers
  - Content Type
  - Follow redirects?
  - Accepted HTTP Status Codes
  - Auth

- Notification:
  - Email
  - SMS
  - Phone Call
  - App
  - Webhook

## Workers

The worker will be responsible for running the checks. A worker starts up and connects to the server (securely). It will be receive a list of checks to run.

It will create a pool of workers that will run the checks in parallel. Each check will send the results back to the server.

Lifecycle:

- Start up
- Connect to server
- Receive list of checks to run
- Create worker pool
  - distrubute checks
  - individual workers send results back to the server
- Sleep for a bit
- Repeat
