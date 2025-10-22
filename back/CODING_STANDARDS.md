# Coding Standards & Best Practices

## Table of Contents

1. [General Coding Standards](#general-coding-standards)
2. [Security Best Practices](#security-best-practices)
3. [Swagger/OpenAPI Documentation Standards](#swaggeropenapi-documentation-standards)
4. [Error Handling](#error-handling)
5. [Testing Standards](#testing-standards)

---

## General Coding Standards

### TypeScript & Code Style

#### 1. **Use Strict TypeScript**

Always enable strict mode in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

#### 2. **Avoid `any` Type**

```typescript
// ❌ Bad
function processData(data: any) {
  return data.value;
}

// ✅ Good
interface DataInput {
  value: string;
}

function processData(data: DataInput): string {
  return data.value;
}
```

#### 3. **Use Functional Programming Patterns**

```typescript
// ❌ Bad - Using classes unnecessarily
class UserValidator {
  validate(user: User): boolean {
    return !!user.email;
  }
}

// ✅ Good - Pure function
function validateUser(user: User): boolean {
  return !!user.email;
}
```

#### 4. **Descriptive Variable Names**

```typescript
// ❌ Bad
const u = await repo.find();
const flag = true;

// ✅ Good
const users = await userRepository.find();
const isEmailVerified = true;
const hasAdminRole = false;
```

#### 5. **Early Returns for Guard Clauses**

```typescript
// ❌ Bad
async function updateUser(id: string, data: UpdateUserDto) {
  const user = await findUser(id);
  if (user) {
    if (user.isActive) {
      // ... nested logic
    }
  }
}

// ✅ Good
async function updateUser(id: string, data: UpdateUserDto) {
  const user = await findUser(id);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (!user.isActive) {
    throw new ForbiddenException('User account is inactive');
  }

  // Main logic here
  return await userRepository.update(id, data);
}
```

#### 6. **File and Directory Naming**

- Use lowercase with dashes for directories: `auth-middleware/`, `user-profile/`
- Use PascalCase for class files: `UserService.ts`, `AuthController.ts`
- Use kebab-case for other files: `jwt.config.ts`, `database.config.ts`

---

## Security Best Practices

### 1. **Input Validation**

#### Always Validate User Input

```typescript
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  password: string;
}
```

#### Use ValidationPipe Globally

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
    transform: true, // Auto-transform payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: false, // Explicit type conversion only
    },
  }),
);
```

### 2. **Password Security**

```typescript
import * as bcrypt from 'bcryptjs';

// ✅ Hash passwords with appropriate salt rounds
export class AuthService {
  private readonly SALT_ROUNDS = 12; // Use 12+ rounds for production

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
```

**Never:**

- Store passwords in plain text
- Log passwords or sensitive data
- Return passwords in API responses
- Use weak hashing algorithms (MD5, SHA1)

### 3. **JWT Security**

```typescript
// jwt.config.ts
export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => ({
  secret: configService.get<string>('JWT_SECRET'), // Use strong, random secret
  signOptions: {
    expiresIn: '15m', // Short-lived access tokens
    algorithm: 'HS256',
    issuer: 'your-app-name',
    audience: 'your-app-users',
  },
});
```

**Best Practices:**

- Use short-lived access tokens (15-30 minutes)
- Implement refresh tokens for longer sessions
- Store tokens securely (httpOnly cookies for web)
- Validate token issuer and audience
- Implement token blacklisting for logout

### 4. **SQL Injection Prevention**

```typescript
// ✅ Good - Using TypeORM with parameterized queries
async findUserByEmail(email: string): Promise<User | null> {
  return await this.userRepository.findOne({
    where: { email }, // Parameterized automatically
  });
}

// ❌ Bad - Raw SQL without parameters (vulnerable)
async findUserByEmail(email: string): Promise<User | null> {
  return await this.userRepository.query(
    `SELECT * FROM users WHERE email = '${email}'`
  );
}

// ✅ Good - Raw SQL with parameters
async findUserByEmail(email: string): Promise<User | null> {
  return await this.userRepository.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
}
```

### 5. **Rate Limiting**

```typescript
// Install: pnpm add @nestjs/throttler

// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // Time window in seconds
      limit: 10, // Max requests per ttl
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

// Apply custom rate limits to specific endpoints
@Post('login')
@Throttle(5, 60) // 5 attempts per minute for login
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

### 6. **CORS Configuration**

```typescript
// main.ts
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 3600, // Cache preflight requests
});
```

### 7. **Security Headers (Helmet)**

```typescript
import helmet from 'helmet';

// main.ts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);
```

### 8. **Sensitive Data Protection**

```typescript
// user.entity.ts
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  @Exclude() // Never expose in responses
  password: string;

  @Column({ nullable: true })
  @Exclude() // Don't expose reset tokens
  resetToken?: string;
}

// Enable class-transformer globally
// main.ts
app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
```

### 9. **Environment Variables**

```typescript
// ✅ Good - Never commit sensitive data
// .env (add to .gitignore)
DATABASE_PASSWORD = super_secure_password;
JWT_SECRET = random_256_bit_secret_key;

// .env.example (commit this)
DATABASE_PASSWORD = your_database_password;
JWT_SECRET = your_jwt_secret_key;
```

**Best Practices:**

- Use strong, randomly generated secrets
- Rotate secrets regularly
- Use different secrets for development/staging/production
- Never hardcode secrets in source code
- Use secret management services in production (AWS Secrets Manager, Azure Key Vault)

### 10. **Authorization Guards**

```typescript
// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Always validate user exists
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return requiredRoles.includes(user.role);
  }
}

// Usage in controller
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Delete(':id')
async deleteUser(@Param('id') id: string) {
  return this.usersService.remove(id);
}
```

---

## Swagger/OpenAPI Documentation Standards

### 1. **Main Configuration**

```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('Your API Title')
  .setDescription('Detailed API description with key features and usage')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .addTag('Auth', 'Authentication endpoints')
  .addTag('Users', 'User management endpoints')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document, {
  swaggerOptions: {
    persistAuthorization: true, // Keep auth token after page refresh
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
});
```

### 2. **DTO Documentation**

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 128,
    required: true,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  firstName?: string;
}
```

### 3. **Controller Documentation**

```typescript
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ApiStandardResponses } from '../common/decorators/api-response.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({
    summary: 'Create new user',
    description:
      'Creates a new user account. Admin role required. Password is automatically hashed.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiStandardResponses(UserResponseDto, {
    status: 201,
    description: 'User created successfully',
    message: 'User created successfully',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves detailed user information by UUID',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (UUID)',
    example: 'c4ca4238-a0b9-4382-8dcc-509a6f75849b',
    type: String,
  })
  @ApiStandardResponses(UserResponseDto, {
    status: 200,
    description: 'User retrieved successfully',
  })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
```

### 4. **Response DTOs**

```typescript
export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: 'c4ca4238-a0b9-4382-8dcc-509a6f75849b',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-10-17T21:00:00.000Z',
  })
  createdAt: Date;
}
```

### 5. **Standard Response Format**

All API responses follow this standardized format:

```typescript
{
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}
```

**Success Response Example:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "c4ca4238-a0b9-4382-8dcc-509a6f75849b",
    "email": "john.doe@example.com",
    "role": "user"
  },
  "timestamp": "2025-10-17T21:00:00.000Z"
}
```

**Error Response Example:**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "statusCode": 400,
    "message": ["email must be an email", "password is too short"],
    "error": "Bad Request"
  },
  "timestamp": "2025-10-17T21:00:00.000Z"
}
```

### 6. **Custom Swagger Decorators**

```typescript
// common/decorators/api-response.decorator.ts
import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

export const ApiStandardResponses = (
  dataType?: Type<unknown>,
  options?: {
    status?: number;
    description?: string;
    message?: string;
    isArray?: boolean;
  },
) => {
  const decorators: Array<MethodDecorator & ClassDecorator> = [];

  if (dataType) {
    decorators.push(ApiExtraModels(dataType));
  }

  decorators.push(
    ApiResponse({
      status: options?.status || 200,
      description: options?.description || 'Successful response',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: options?.message || 'Success' },
          data: dataType
            ? options?.isArray
              ? { type: 'array', items: { $ref: getSchemaPath(dataType) } }
              : { $ref: getSchemaPath(dataType) }
            : { type: 'object' },
          timestamp: { type: 'string', example: new Date().toISOString() },
        },
      },
    }),
  );

  return applyDecorators(...decorators);
};
```

### 7. **Swagger Documentation Checklist**

For every endpoint, ensure:

- [ ] `@ApiTags()` applied to controller
- [ ] `@ApiOperation()` with summary and description
- [ ] `@ApiBearerAuth()` for protected endpoints
- [ ] `@ApiParam()` for all route parameters
- [ ] `@ApiBody()` for request body
- [ ] `@ApiStandardResponses()` for response format
- [ ] All DTOs have `@ApiProperty()` decorators
- [ ] Enums are properly documented
- [ ] Examples provided for all properties
- [ ] Validation rules reflected in documentation

### 8. **Documenting Enums**

```typescript
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Role to assign to the user',
    enum: UserRole,
    enumName: 'UserRole',
    example: UserRole.USER,
  })
  @IsEnum(UserRole)
  role: UserRole;
}
```

---

## Error Handling

### 1. **Global Exception Filter**

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse = {
      success: false,
      message: message,
      error: {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(process.env.NODE_ENV !== 'production' && {
          stack: exception instanceof Error ? exception.stack : undefined,
        }),
      },
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
```

### 2. **Custom Exception Classes**

```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super('Invalid email or password', HttpStatus.UNAUTHORIZED);
  }
}

// Usage
async findUser(id: string): Promise<User> {
  const user = await this.userRepository.findOne({ where: { id } });
  if (!user) {
    throw new UserNotFoundException(id);
  }
  return user;
}
```

---

## Testing Standards

### 1. **Unit Tests**

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('password', 10),
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
```

### 2. **E2E Tests**

```typescript
describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should return access token for valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.accessToken).toBeDefined();
        });
    });

    it('should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});
```

---

## Additional Resources

- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)

---

**Last Updated:** October 17, 2025  
**Version:** 1.0
