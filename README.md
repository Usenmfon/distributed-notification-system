# Distributed Notification System

## Overview

This is a scalable, microservices-based system for multi-channel notifications (email & push).  
The solution is composed of the following services:

- `api-gateway` (Laravel): Main entrypoint & orchestrator.
- `user-service` (NestJS): Manages user profiles, contact info, notification preferences.
- `template-service` (NestJS): Manages notification templates, variable rendering.
- `email-service` (NestJS): Delivers email notifications.
- `push-service` (NestJS): Delivers push notifications.
- `rabbitmq`: Queue broker powering async delivery and retries.
- `postgres`: Data storage for gateway/service state.
- `redis`: Caching and idempotency for notifications.
- `nginx`: Reverse proxy and static asset handler.

## Architecture

See `system-design.png` for full diagram.

**Main Flow:**
1. Client/system sends notification request to API Gateway.
2. Gateway validates data, checks idempotency, fetches user info.
3. Notification details are stored in DB and published to RabbitMQ.
4. Email and Push services consume queue messages, fetch templates, personalize, deliver notifications.
5. Services post delivery status updates to API Gateway, which updates notification records.
6. Monitoring endpoints and logs provide visibility into system health and operations.

## Features

- **Idempotency** and duplicate prevention.
- **Horizontal scaling** of API and delivery services.
- **Dead letter queues** and retry strategies for failed messages.
- **Real-time queue monitoring** via RabbitMQ UI (localhost:15672).
- **Centralized health checks** for all dependencies.

## Getting Started

### Prerequisites

- Docker (and docker-compose)
- NodeJS / npm
- PHP >= 8.2
- Composer

### Setup

1. **Clone repository**

    ```
    git clone <repo-url>
    cd distributed-notification-system
    ```

2. **Start all services**

    ```
    docker-compose up --build
    ```

3. **Access API Gateway**

    - Via Nginx:  
      `http://localhost:8000`

4. **RabbitMQ management**

    - `http://localhost:15672` (guest/guest)

5. **Run tests**

    - API Gateway:  
      ```
      cd api-gateway
      php artisan test
      ```

### Service Endpoints

| Service         | Port      | Description                          |
|-----------------|-----------|--------------------------------------|
| api-gateway     | 8000      | Main API                              |
| user-service    | 4000      | User profiles & preferences           |
| template-service| 4100      | Template management                   |
| email-service   | 4200      | Email delivery                        |
| push-service    | 4300      | Push delivery                         |
| rabbitmq        | 5672/15672| Queue broker / Management UI          |
| postgres        | 5432      | Database                              |
| redis           | 6379      | Cache                                 |

### Folder Structure

distributed-notification-system/
├── api-gateway/
├── user-service/
├── email-service/
├── push-service/
├── template-service/
├── nginx.conf
├── docker-compose.yml
└── system-design.png


## Configuration

- All environment variables for each service are managed in their respective `.env` files.
- Make sure to adjust connection strings, secrets, and ports as needed per environment.

## Scaling & Deployment

- The system supports horizontal scaling for stateless services.
- Queued message ingestion auto-scales with consumers.
- Can be deployed to any cloud or on-premise environment supporting Docker.

## Troubleshooting

- Check logs (`docker-compose logs <service>`).
- Use health endpoints (`/v1/health`, etc.).
- Access RabbitMQ management for message queue diagnostics.

## License

MIT

---