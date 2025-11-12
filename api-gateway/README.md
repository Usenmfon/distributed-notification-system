# API Gateway - Distributed Notification System

## Overview

This Laravel-based API Gateway serves as the main entrypoint for notification requests in the distributed notification system architecture. It handles validation, user lookup, idempotency checks, notification record management, and publishes messages to RabbitMQ for downstream processing.

## Key Features

- **REST Endpoints:**  
  - `POST /v1/notifications`: Create a notification request (email or push).
  - `GET /v1/notifications/{request_id}/status`: Check notification status.
  - `POST /v1/notifications/status/update`: Update delivery status (used by downstream services).
  - `GET /v1/health`: Health check for system dependencies (DB, Redis, RabbitMQ).

- **Idempotency Handling:**  
  Prevents duplicate notifications by caching and checking request IDs.

- **User Service Integration:**  
  Fetches user contact info and preferences before queuing.

- **RabbitMQ Queues:**  
  Publishes notification messages to separate queues for email and push notifications.

- **Centralized Exception Handling:**  
  Ensures robust error responses and logs.

- **CorrelationMiddleware:**  
  Traces request IDs for distributed tracing.

## Setup & Installation

1. **Install dependencies**
    ```
    composer install
    ```

2. **Configure Environment**
    - Copy `.env.example` to `.env` and update connection parameters for DB, RabbitMQ, Redis, User Service, etc.

3. **Run Migrations**
    ```
    php artisan migrate
    ```

4. **Start Development Server**
    ```
    php artisan serve
    ```

5. **Dockerized Setup (Recommended)**
    - Use the root project's `docker-compose.yml` to start all services together:
      ```
      docker-compose up --build
      ```
