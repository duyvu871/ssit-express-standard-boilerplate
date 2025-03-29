# SSIT Standard Express Boilerplate

## Project Overview

A robust, production-ready Express.js server boilerplate with TypeScript, Prisma ORM, and comprehensive authentication system. This boilerplate provides a solid foundation for building secure, scalable, and maintainable backend applications.

### Features

- **TypeScript Integration**: Full TypeScript support for better type safety and developer experience
- **Authentication System**: Complete JWT-based authentication with refresh tokens
- **Role-Based Access Control**: Flexible permission system with user roles
- **Prisma ORM**: Modern database toolkit for PostgreSQL
- **Error Handling**: Centralized error handling with custom error classes
- **Request Validation**: Input validation using Zod schema
- **API Documentation**: Well-documented API endpoints with Swagger/OpenAPI integration
- **Logging**: Request logging with Morgan and Winston
- **Testing**: Jest setup for unit and integration tests
- **Docker Support**: Containerization with Docker and Docker Compose

### Technologies Used

- Node.js (>=18)
- Express.js
- Alpinejs (for UI components)
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (JSON Web Tokens)
- Zod (Validation)
- Redis (for caching and session management)
- Socket.IO (for real-time communication)
- Swagger/OpenAPI (for API documentation)
- Jest (for testing)
- Docker

## Installation Guide

### Prerequisites

- Node.js (>=18)
- npm or yarn
- PostgreSQL database
- Redis (optional, for caching and session management)

### Installation Steps

1. Clone the repository

```bash
git clone <repository-url>
cd ssit-standrad-express-boilerplate
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development
HOST=localhost
PORT=4001
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
SESSION_SECRET=your_session_secret
```

4. Run database migrations

```bash
npx prisma migrate dev
```

5. Start the development server

```bash
npm run dev
```

### Using Docker

Alternatively, you can use Docker Compose to run the application:

```bash
docker-compose up -d
```

## Project Structure

```
📦 Project Root  
├── 📄 .dockerignore  
├── 📄 .eslint.js  
├── 📄 .eslintignore  
├── 📄 .gitignore  
├── 📄 .prettierignore  
├── 📄 .prettierrc  
├── 📄 Dockerfile             # Docker build configuration  
├── 📄 README.md              # Project documentation  
├── 📂 doc                    # Documentation files  
│   ├── 📄 coding-convention.md  
│   └── 📄 common-feature.md  
├── 📄 docker-compose.yml     # Docker Compose configuration  
├── 📄 jest.config.js         # Jest testing configuration  
├── 📂 nginx                  # Nginx configuration and SSL setup  
│   ├── 📄 setup.sh  
│   ├── 📂 sites-available    # Virtual host configurations  
│   │   └── 📄 domain.com.conf  
│   └── 📂 ssl                # SSL certificates  
│       └── 📄 example.pem  
├── 📄 package-lock.json  
├── 📄 package.json  
├── 📂 prisma                 # Prisma ORM database schema  
│   └── 📄 schema.prisma  
├── 📂 setup                  # Setup scripts for the project  
│   └── 📄 setup-project.sh  
├── 📂 src                     # Main application source code  
│   ├── 📂 @types              # Type definitions  
│   │   ├── 📄 environment.d.ts  
│   │   └── 📄 global.d.ts  
│   ├── 📂 api                 # API logic (controllers, routes, services)  
│   │   ├── 📂 controllers     # Handles request logic  
│   │   ├── 📂 middlewares     # Express middlewares  
│   │   ├── 📂 routes          # API route definitions  
│   │   ├── 📂 services        # Business logic layer  
│   │   └── 📂 validations     # Request validation schemas  
│   ├── 📂 common              # Shared constants, enums, and types  
│   │   ├── 📂 enums           # Enum definitions  
│   │   ├── 📂 interfaces      # TypeScript interfaces  
│   │   ├── 📂 models          # Data models  
│   │   ├── 📄 constants.ts  
│   │   ├── 📄 http-status-code.ts  
│   │   └── 📄 types.ts  
│   ├── 📂 configs             # Configuration files  
│   │   ├── 📂 __mocks__  
│   │   │   └── 📄 app-config.ts  
│   │   ├── 📄 app.config.ts   # Application settings  
│   │   ├── 📄 path.config.ts  # Path-related configuration  
│   │   └── 📄 swagger.config.ts # Swagger API documentation config  
│   ├── 📂 loaders             # Loaders for initializing services (Express, Redis, WebSocket)  
│   │   ├── 📄 cronjob.loader.ts  
│   │   ├── 📄 express.loader.ts  
│   │   ├── 📄 index.ts  
│   │   ├── 📄 redis.loader.ts  
│   │   └── 📄 websocket.loader.ts  
│   ├── 📂 repositories        # Database repository layer  
│   │   ├── 📄 permission.repository.ts  
│   │   ├── 📄 prisma.ts  
│   │   ├── 📄 role.repository.ts  
│   │   ├── 📄 subscription.repository.ts  
│   │   └── 📄 user.repository.ts  
│   ├── 📂 responses           # API response handlers and error management  
│   │   ├── 📂 client-errors   # 4xx error responses  
│   │   ├── 📂 server-errors   # 5xx error responses  
│   │   ├── 📂 service-response # Responses for services  
│   │   ├── 📂 success-response # Successful response formats  
│   │   ├── 📄 error-handler.ts # Global error handler  
│   ├── 📂 shared              # Shared utilities and logging  
│   │   ├── 📂 logger          # Logging utilities  
│   │   └── 📂 utils           # Utility functions  
│   ├── 📄 server.ts           # Application entry point  
├── 📂 storage                 # File storage (assets, temporary files, and static content)  
│   ├── 📂 assets  
│   │   ├── 📂 main  
│   │   │   └── 📄 .gitkeep  
│   │   └── 📂 temp  
│   │       └── 📄 .gitkeep  
│   └── 📂 statics  
│       └── 📄 .gitkeep  
├── 📄 tsconfig.json           # TypeScript configuration  
└── 📄 tsup.config.ts          # TSUP bundler configuration  
```

### Key Files

- `src/server.ts`: Application entry point
- `src/loaders/express.loader.ts`: Express server configuration
- `src/api/routes.ts`: API route definitions
- `src/api/middlewares/authenticate.ts`: Authentication middleware
- `prisma/schema.prisma`: Database schema definition

## API Documentation

API documentation is available through Swagger UI at `/api-docs` when the server is running.

### Authentication Endpoints

#### Register a new user
- **URL**: `/api/v1/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "user123",
    "email": "user@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response**: User data and authentication tokens

#### Login
- **URL**: `/api/v1/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "user123",
    "password": "securePassword123"
  }
  ```
- **Response**: User data and authentication tokens

#### Refresh Token
- **URL**: `/api/v1/auth/refresh-token`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```
- **Response**: New access and refresh tokens

#### Logout
- **URL**: `/api/v1/auth/logout`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```

#### Get User Profile
- **URL**: `/api/v1/auth/profile`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer your-access-token`

#### Change Password
- **URL**: `/api/v1/auth/change-password`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer your-access-token`
- **Body**:
  ```json
  {
    "currentPassword": "currentPassword123",
    "newPassword": "newPassword123"
  }
  ```

#### Request Password Reset
- **URL**: `/api/v1/auth/request-password-reset`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```

#### Reset Password
- **URL**: `/api/v1/auth/reset-password`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "token": "reset-token",
    "newPassword": "newPassword123"
  }
  ```

### Health Check
- **URL**: `/api/v1/health`
- **Method**: `GET`
- **Response**: Server health status

## Database Models

The application uses Prisma ORM with PostgreSQL. The main models include:

### User
Stores user account information:
- `id`: Unique identifier
- `username`: Unique username
- `email`: Unique email address
- `passwordHash`: Hashed password
- `isActive`: Account status
- Relations: UserRole, RefreshToken, UserProfile, etc.

### Role
Defines user roles in the system:
- `id`: Unique identifier
- `name`: Role name (e.g., USER, ADMIN)
- Relations: UserRole, RolePermission

### Permission
Defines system permissions:
- `id`: Unique identifier
- `name`: Permission name
- Relations: RolePermission

### UserRole
Many-to-many relationship between User and Role:
- `userId`: User ID
- `roleId`: Role ID

### RefreshToken
Stores JWT refresh tokens:
- `id`: Unique identifier
- `userId`: User ID
- `token`: Refresh token string
- `expiresAt`: Token expiration date

### UserProfile
Stores detailed user information:
- `id`: Unique identifier
- `userId`: User ID
- `firstName`: User's first name
- `lastName`: User's last name
- Additional profile fields

## Caching Strategies

The application implements several caching strategies using Redis:

### Cache Patterns

- **Data Caching**: Frequently accessed database queries are cached to reduce database load
- **Response Caching**: Common API responses are cached to improve response times
- **Session Caching**: User sessions are stored in Redis for stateless authentication

### Cache Invalidation

- **Time-based (TTL)**: Cache entries automatically expire after a configured time period
- **Event-based**: Cache is invalidated when related data is modified
- **Manual Purge**: Admin endpoints available for manually clearing specific cache entries

### Implementation

- Cache middleware for route-level caching
- Service-level cache methods for fine-grained control
- Configurable TTL values based on data type and access patterns

## Authentication System

The application uses a JWT-based authentication system with the following components:

### Token Generation
- Access tokens: Short-lived tokens for API access
- Refresh tokens: Long-lived tokens for obtaining new access tokens

### Authentication Flow
1. User registers or logs in
2. Server generates access and refresh tokens
3. Client uses access token for API requests
4. When access token expires, client uses refresh token to get a new access token
5. Refresh tokens are stored in the database and can be revoked

### Middleware
The `authenticate` middleware:
- Extracts the JWT from the Authorization header
- Verifies the token signature and expiration
- Adds user information to the request object

## Development Guidelines

### Coding Standards

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful comments and documentation

### Git Workflow

1. Create feature branches from `develop`
2. Submit pull requests for code review
3. Merge approved PRs into `develop`
4. Release from `develop` to `main`

### Testing

Run tests with:

```bash
npm test
```

Write tests for:
- Services
- Controllers
- Utilities

### Building for Production

```bash
npm run build
```

The compiled output will be in the `dist` directory.

### Deployment

1. Build the application
2. Set production environment variables
3. Run database migrations
4. Start the server with `npm start`

## Troubleshooting

### Common Issues

- **Database Connection Errors**: Check your DATABASE_URL environment variable
- **Authentication Failures**: Ensure your JWT secrets are properly set
- **Prisma Errors**: Run `npx prisma generate` after schema changes

## License

ISC License

## Credits

Developed by BUIANDU