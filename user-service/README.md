# User Service

Microservice for managing user accounts, authentication, and notification preferences.

## Tech Stack
- NestJS (Node.js framework)
- PostgreSQL (Database)
- Redis (Caching)
- TypeORM (ORM)
- JWT (Authentication)

## Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

## Setup

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment
\`\`\`bash
cp .env.example .env
# Edit .env with your credentials
\`\`\`

### 3. Run with Docker
\`\`\`bash
docker-compose up --build
\`\`\`

### 4. Run Locally
\`\`\`bash
# Start PostgreSQL and Redis first
npm run start:dev
\`\`\`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login

### Users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users` - List users (paginated)
- `GET /api/v1/users/:id` - Get user by ID
- `GET /api/v1/users/:id/preferences` - Get user preferences
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Health
- `GET /health` - Service health check

## Testing

\`\`\`bash
# Create a user
curl -X POST http://localhost:3001/api/v1/users \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "preferences": {
      "email": true,
      "push": false
    }
  }'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'

# Health check
curl http://localhost:3001/health
\`\`\`

## Features
 User registration & authentication
 JWT token-based auth
 Password hashing with bcrypt
 User preference management
 Redis caching for preferences
 Pagination support
 Input validation
 Health check endpoint

## Database Schema

\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  push_token VARCHAR,
  preferences JSONB DEFAULT '{"email": true, "push": true}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## Team Member
Queen - User Service