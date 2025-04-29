# Up

A simple and powerful website uptime tracker built for devs and small teams.

## Local Development

To start, run the database:

```bash
make dev.db.up
```

Then you can run the primary webapp:

```bash
make run
```

To run any checks you will need to run the worker locally as well:

```bash
AUTH_TOKEN=admin make worker
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
