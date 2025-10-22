# NestJS Production Backend

A production-ready backend built with NestJS, TypeScript, PostgreSQL, TypeORM, and JWT authentication.

## 🚀 Features

- ✅ **PostgreSQL + TypeORM + Migrations**
- ✅ **JWT Authentication** (Access + Refresh tokens)
- ✅ **User Registration/Login/Forgot/Reset Password**
- ✅ **Role-based Authorization** (Admin, User)
- ✅ **SMTP Email Integration** (Password reset, Welcome emails)
- ✅ **Standardized API Response Format**
- ✅ **Clean modular architecture** (TypeScript)
- ✅ **Security middleware** (Helmet, CORS)
- ✅ **Input validation** (class-validator)
- ✅ **Docker support**

## 📁 Project Structure

```
src/
├── main.ts
├── app.module.ts
├── config/
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── mail.config.ts
├── common/
│   ├── filters/
│   │   └── global-exception.filter.ts
│   └── interceptors/
│       └── response.interceptor.ts
├── entities/
│   └── user.entity.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── dto/
│       └── auth.dto.ts
├── roles/
│   ├── roles.decorator.ts
│   ├── roles.guard.ts
│   └── role.enum.ts
├── mail/
│   ├── mail.module.ts
│   ├── mail.service.ts
│   └── templates/
│       ├── password-reset.template.ts
│       └── welcome.template.ts
└── migrations/
```

## 🔧 Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- pnpm (recommended) or npm

### Installation

1. **Clone and install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start PostgreSQL database:**

   ```bash
   # Using Docker Compose
   docker-compose up -d db

   # Or start your local PostgreSQL instance
   ```

4. **Run migrations:**

   ```bash
   pnpm migration:run
   ```

5. **Start the development server:**
   ```bash
   pnpm start:dev
   ```

The API will be available at `http://localhost:3000`

## 📧 Email Configuration

The application uses SMTP for sending emails (password reset, welcome emails, etc.). Configure your email provider in the `.env` file.

### Gmail Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device
   - Copy the generated 16-character password
3. **Update your `.env` file**:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM_NAME=Your App Name
SMTP_FROM_EMAIL=your-email@gmail.com
```

### Other SMTP Providers

**Mailtrap** (for testing):

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
```

**SendGrid**:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Mailgun**:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

**AWS SES**:

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

### Email Templates

The application includes beautiful HTML email templates for:

- **Password Reset**: Secure link with 1-hour expiration
- **Welcome Email**: Onboarding message for new users

Templates are located in `src/mail/templates/` and can be customized to match your brand.

## 🔑 API Endpoints

### Authentication

- `POST /auth/login` - Login (returns access token only)
- `POST /auth/forgot-password` - Send password reset email
- `POST /auth/reset-password` - Reset password using token
- `GET /auth/me` - Get current user profile

### User Management (Admin Only)

- `POST /api/v1/users` - Create new user (with role assignment)
- `GET /api/v1/users` - Get all users (with pagination and filters)
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `PATCH /api/v1/users/:id/toggle-active` - Toggle user active status
- `DELETE /api/v1/users/:id` - Delete user
- `GET /api/v1/users/available-managers` - Get users available to be assigned as managers

### Office Management

- `POST /api/v1/offices` - Create new office
- `GET /api/v1/offices` - Get all offices
- `GET /api/v1/offices/:id` - Get office by ID
- `PATCH /api/v1/offices/:id` - Update office
- `DELETE /api/v1/offices/:id` - Delete office
- `POST /api/v1/offices/:id/assign-manager` - Assign manager to office
- `DELETE /api/v1/offices/:id/managers/:managerId` - Remove manager from office

## 🔒 Authentication & Authorization

### User Roles

- `USER` - Default registered user
- `MANAGER` - Can manage assigned offices
- `ADMIN` - Has elevated permissions (can create users, assign managers, manage offices)

### JWT Tokens

- **Access Token**: 15 minutes (configurable)
- **Refresh Token**: Disabled by default (can be enabled via `REFRESH_TOKEN_ENABLED=true`)

### Usage

```typescript
// Protect routes with JWT
@UseGuards(JwtAuthGuard)
@Get('protected')
async protectedRoute() {}

// Admin only routes
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get('admin-only')
async adminRoute() {}
```

### Enabling Refresh Tokens (Optional)

If you need refresh token functionality, you can easily enable it:

1. **Set environment variable:**

   ```bash
   REFRESH_TOKEN_ENABLED=true
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
   ```

2. **Uncomment the refresh endpoint in `src/auth/auth.controller.ts`**

3. **Uncomment the refreshToken method in `src/auth/auth.service.ts`**

4. **Uncomment the getJwtRefreshConfig function in `src/config/jwt.config.ts`**

## 👥 User Management Workflow

### Initial Setup

1. **Run the seed to create admin user:**

   ```bash
   pnpm seed:run
   ```

   Default admin credentials:
   - Email: `admin@tugza.tech`
   - Password: `Admin@123456`
   - ⚠️ **Important:** Change the password after first login!

### Creating Users with Manager Role

2. **Login as admin:**

   ```bash
   POST /api/v1/auth/login
   {
     "email": "admin@tugza.tech",
     "password": "Admin@123456"
   }
   ```

3. **Create a user with MANAGER role:**

   ```bash
   POST /api/v1/users
   Authorization: Bearer <admin_access_token>
   {
     "email": "manager@example.com",
     "password": "SecurePass123!",
     "firstName": "John",
     "lastName": "Doe",
     "role": "MANAGER",
     "isActive": true
   }
   ```

### Assigning Managers to Offices

4. **Get available managers (not assigned to any office):**

   ```bash
   GET /api/v1/users/available-managers
   Authorization: Bearer <admin_access_token>
   ```

5. **Assign manager to an office:**

   ```bash
   POST /api/v1/offices/:officeId/assign-manager
   Authorization: Bearer <admin_access_token>
   {
     "managerId": "uuid-of-manager"
   }
   ```

   **Note:**
   - Users can only be assigned to one office at a time
   - When assigned, USER role is automatically upgraded to MANAGER (unless ADMIN)
   - ADMINs can be assigned without role change

6. **Remove manager from office:**

   ```bash
   DELETE /api/v1/offices/:officeId/managers/:managerId
   Authorization: Bearer <admin_access_token>
   ```

   **Note:** When removed, MANAGER role is automatically downgraded to USER (unless ADMIN)

### Permissions

The system uses role-based permissions:

**ADMIN** can:

- Create, update, delete users
- Create, update, delete offices
- Assign/remove managers
- View all reports and data

**MANAGER** can:

- View assigned office details
- Update assigned office information
- View office reports
- Assign managers (to their office)

**USER** can:

- View office information
- View their own profile

## 📝 API Response Format

All API responses follow this standardized format:

```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "timestamp": string
}
```

### Success Response Example

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "USER"
  },
  "timestamp": "2025-01-17T18:00:00.000Z"
}
```

### Error Response Example

```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "timestamp": "2025-01-17T18:00:00.000Z"
}
```

## 🐳 Docker

### Development

```bash
# Start PostgreSQL only
docker-compose up -d db

# Start full stack
docker-compose up
```

### Production

```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Database Migrations

```bash
# Generate migration
pnpm migration:generate src/migrations/InitialMigration

# Run migrations
pnpm migration:run

# Revert last migration
pnpm migration:revert
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## 🔐 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- Helmet security headers
- CORS configuration
- SQL injection protection (TypeORM)

## 🚀 Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure proper CORS origins
4. Set up SSL/TLS
5. Use environment-specific database credentials
6. Configure email service for password reset
7. Set up monitoring and logging

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
