# Email-Push Microservice

Background worker that processes email and push notifications from RabbitMQ queues.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672
EMAIL_QUEUE=email_queue
PUSH_QUEUE=push_queue

# SMTP Configuration (Email Sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Push Notification API (Optional - leave empty if not using)
PUSH_API_URL=

# Status Tracking API (Gateway Service)
STATUS_API_URL=http://localhost:3000/api/v1/notifications/status

# Service Port
PORT=3001

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
