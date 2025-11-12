# Notification Template Service API 📝

## Overview

A robust backend service built with NestJS and TypeScript, leveraging TypeORM for efficient management and versioning of notification templates (email, push) in a PostgreSQL database. It serves as a core component of a distributed notification system, enabling dynamic content delivery.

## Features

- **NestJS**: Provides a scalable, modular application architecture for developing maintainable services.
- **TypeScript**: Ensures strong type safety and enhances code quality and developer experience.
- **TypeORM**: An Object-Relational Mapper for seamless and efficient interaction with the PostgreSQL database.
- **PostgreSQL**: Stores template definitions and their various versions, ensuring data integrity and persistence.
- **Template Definition Management**: Allows for the creation and retrieval of distinct notification template categories.
- **Advanced Template Versioning**: Supports creating multiple versions for each template definition, accommodating language variations and content updates.
- **Dynamic Active Template Retrieval**: Facilitates fetching the currently active template version based on specific criteria (code, language, type).
- **Transactional Activation**: Ensures atomic updates when activating a new template version, maintaining data consistency.

## Getting Started

To get this project up and running on your local machine, follow these steps.

### Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Usenmfon/distributed-notification-system.git
    cd distributed-notification-system/template-service
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run Migrations (if applicable) and Start the Application**:
    This project uses `synchronize: true` in `TypeOrmModule.forRoot` for development, which automatically syncs entities to the database schema. For production, consider using explicit migrations.
    ```bash
    npm run start:dev
    ```
    The application will typically run on `http://localhost:3000` or the port specified in your environment variables.

### Environment Variables

The following environment variables are required to run the application:

- `PORT`: The port on which the NestJS application will listen.
  - Example: `PORT=3000`
- `DB_URL`: The connection string for your PostgreSQL database.
  - Example: `DB_URL=postgres://user:password@localhost:5432/database_name`

## API Documentation

### Base URL

`/api/v1/templates`

### Endpoints

#### GET /api/v1/templates

Retrieves all defined notification templates.
**Request**:
No request body.

**Response**:

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "template_code": "welcome",
    "notification_type": "email",
    "description": "Welcome email for new users",
    "created_at": "2023-10-27T10:00:00.000Z",
    "updated_at": "2023-10-27T10:00:00.000Z"
  }
]
```

**Errors**:

- `500 Internal Server Error`: An unexpected error occurred while fetching template definitions.

#### POST /api/v1/templates

Creates a new notification template definition.
**Request**:

```json
{
  "template_code": "welcome",
  "notification_type": "email",
  "description": "Welcome email for new users"
}
```

**Response**:

```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "template_code": "welcome",
  "notification_type": "email",
  "description": "Welcome email for new users",
  "created_at": "2023-10-27T10:00:00.000Z",
  "updated_at": "2023-10-27T10:00:00.000Z"
}
```

**Errors**:

- `400 Bad Request`:
  - `{"message": "All fields are required"}`: One or more required fields (template_code, notification_type, description) are missing.
  - `{"message": "Template code already exists"}`: A template definition with the same `template_code` and `notification_type` already exists.
- `500 Internal Server Error`: An unexpected error occurred during template definition creation.

#### GET /api/v1/templates/active

Retrieves the active version of a template based on its code, language, and type.
**Request**:
Query Parameters:

- `code`: The template_code of the template definition. (e.g., `code=welcome`)
- `lang`: The language_code of the template version. (e.g., `lang=en`)
- `type`: The notification_type (e.g., `type=email` or `type=push`).

**Response**:

```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "version": 2,
  "language_code": "en",
  "content": {
    "body": "Your password has been successfully reset. You can proceed to login now",
    "subject": "Hello [name], your password has been reset"
  },
  "is_active": true
}
```

**Errors**:

- `400 Bad Request`: `{"message": "Invalid parameters in query"}`: Query parameters `code`, `lang`, or `type` are missing or malformed.
- `404 Not Found`: `{"message": "No active template found"}`: No active template version matches the provided criteria.
- `500 Internal Server Error`: An unexpected error occurred while retrieving the active template.

#### POST /api/v1/templates/:template_id/versions

Creates a new version for an existing template definition. If `is_active` is true in the request, this version will also be activated. `is_active` is false by default.
**Request**:

```json
{
  "definition": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "language_code": "en",
  "content": {
    "subject": "Welcome to Our Service!",
    "body": "Thank you for joining. We are excited to have you."
  },
  "is_active": true
}
```

**Response**:

```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "definition": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "template_code": "password_reset",
    "notification_type": "push",
    "description": "This template is used for password reset by users",
    "created_at": "2025-11-12T12:57:46.557Z",
    "updated_at": "2025-11-12T12:57:46.557Z"
  },
  "version": 2,
  "language_code": "en",
  "content": {
    "subject": "Hello [name], your password has been reset",
    "body": "Your password has been successfully reset. You can proceed to login now"
  },
  "is_active": false
}
```

**Errors**:

- `404 Not Found`: `{"message": "Template with id {id} not found"}`: The specified template definition ID does not exist.
- `400 Bad Request`: `{"message": "Template code already exists"}`: (This error originates from the `activate_version` call if `is_active` is true and there's a unique constraint violation, though less likely here).
- `500 Internal Server Error`: An unexpected error occurred during template version creation.

#### PATCH /api/v1/templates/versions/:version_id/activate

Activates a specific version of a template. This will deactivate any other active versions for the same template definition and language.
**Request**:
No request body.

**Response**:

```json
{
  "id": "f1e2d3c4-b5a6-9876-5432-10fedcba9876",
  "version": 2,
  "language_code": "en",
  "content": {
    "subject": "Updated Welcome Message",
    "body": "We've made some improvements. Enjoy!"
  },
  "is_active": true,
  "definition": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "template_code": "welcome",
    "notification_type": "email",
    "description": "Welcome email for new users",
    "created_at": "2023-10-27T10:00:00.000Z",
    "updated_at": "2023-10-27T10:00:00.000Z"
  }
}
```

**Errors**:

- `404 Not Found`: `{"message": "Version not found"}`: The specified `version_id` does not correspond to an existing template version.
- `500 Internal Server Error`: An unexpected error occurred during version activation.

## Usage

The Notification Template Service API allows you to manage notification content efficiently.

1.  **Define a new template**: Use the `POST /api/v1/templates` endpoint to create a base definition for a notification type, such as a "WELCOME_EMAIL" for "email" notifications. This establishes a unique identifier and description for your template.
2.  **Create template versions**: For an existing template definition, you can create multiple versions using `POST /api/v1/templates/:template_id/versions`. Each version can have different content and be associated with a specific `language_code` (e.g., 'en', 'es'). When creating a version, you can optionally set `is_active: true` to immediately make it the current active version for its language.
3.  **Activate a specific version**: If you need to switch which version is active for a given template definition and language, use the `PATCH /api/v1/templates/versions/:version_id/activate` endpoint. This ensures that only one version is active at any time for a particular language of a template.
4.  **Retrieve active templates**: To fetch the content of the currently active template, use `GET /api/v1/templates/active` with query parameters like `code`, `lang`, and `type`. This allows your notification system to always pull the most up-to-date and appropriate content.
5.  **View all template definitions**: The `GET /api/v1/templates` endpoint provides a list of all defined template categories in the system.

## Technologies Used

| Technology            | Description                                                                                                                                        | Link                                                                                     |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| **Node.js**           | Asynchronous event-driven JavaScript runtime                                                                                                       | [nodejs.org](https://nodejs.org/)                                                        |
| **NestJS**            | Progressive Node.js framework for building efficient, reliable, and scalable server-side applications                                              | [nestjs.com](https://nestjs.com/)                                                        |
| **TypeScript**        | Superset of JavaScript that adds optional static typing to the language                                                                            | [typescriptlang.org](https://www.typescriptlang.org/)                                    |
| **TypeORM**           | ORM for TypeScript and JavaScript (ES7, ES6, ES5). Supports MySQL, PostgreSQL, MariaDB, SQLite, MS SQL Server, Oracle, SAP Hana, WebSQL databases. | [typeorm.io](https://typeorm.io/)                                                        |
| **PostgreSQL**        | Powerful, open-source object-relational database system                                                                                            | [postgresql.org](https://www.postgresql.org/)                                            |
| **Class-validator**   | Allows use of decorator-based validation                                                                                                           | [github.com/typestack/class-validator](https://github.com/typestack/class-validator)     |
| **Class-transformer** | Decorator-based transformation for plain objects                                                                                                   | [github.com/typestack/class-transformer](https://github.com/typestack/class-transformer) |

## Contributing

We welcome contributions to enhance this Notification Template Service. To contribute, please follow these guidelines:

- **Fork the repository** and clone it locally.
- **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `git checkout -b bugfix/issue-description`.
- **Implement your changes** and ensure they adhere to the project's coding standards.
- **Write unit and/or integration tests** for your new features or bug fixes.
- **Ensure all tests pass** (`npm test`).
- **Commit your changes** with a clear and concise message.
- **Push your branch** to your forked repository.
- **Open a Pull Request** to the `main` branch of the original repository. Please provide a detailed description of your changes.

---

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-FF4081?style=for-the-badge&logo=typeorm&logoColor=white)](https://typeorm.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: UNLICENSED](https://img.shields.io/badge/License-UNLICENSED-red.svg)](https://choosealicense.com/licenses/unlicense/)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)
