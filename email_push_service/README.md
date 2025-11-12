# Email-Push Microservice

Background worker that processes email and push notifications from RabbitMQ queues.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your SMTP credentials

# Start RabbitMQ (Docker)
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management-alpine

# Run service
npm run start:dev
```

## Message Format

**Queue:** `email_queue` or `push_queue`  
**Pattern:** `{ cmd: 'send_email' }` or `{ cmd: 'send_push' }`

```json
{
  "notification_type": "email",
  "user_email": "user@example.com",
  "template_code": "welcome",
  "variables": { "name": "John", "link": "https://example.com" },
  "request_id": "req_123",
  "priority": 1
}
```

## Health Check

```
GET http://localhost:3001/notification/health
```

## Tests

```bash
npm run test:e2e
```
