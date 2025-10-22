import mailConfig from './mail.config';

// Mock process.env
const originalEnv = process.env;

describe('MailConfig', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return default mail configuration', () => {
    // Clear all environment variables
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_SECURE;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_FROM_NAME;
    delete process.env.SMTP_FROM_EMAIL;

    const config = mailConfig();

    expect(config).toEqual({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: undefined,
        pass: undefined,
      },
      from: {
        name: 'NestJS Office',
        address: undefined,
      },
    });
  });

  it('should return mail configuration with custom environment variables', () => {
    process.env.SMTP_HOST = 'smtp.custom.com';
    process.env.SMTP_PORT = '465';
    process.env.SMTP_SECURE = 'true';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASS = 'password123';
    process.env.SMTP_FROM_NAME = 'Custom App';
    process.env.SMTP_FROM_EMAIL = 'noreply@example.com';

    const config = mailConfig();

    expect(config).toEqual({
      host: 'smtp.custom.com',
      port: 465,
      secure: true,
      auth: {
        user: 'user@example.com',
        pass: 'password123',
      },
      from: {
        name: 'Custom App',
        address: 'noreply@example.com',
      },
    });
  });

  it('should handle secure flag as false', () => {
    process.env.SMTP_SECURE = 'false';

    const config = mailConfig();

    expect(config.secure).toBe(false);
  });

  it('should handle secure flag as true', () => {
    process.env.SMTP_SECURE = 'true';

    const config = mailConfig();

    expect(config.secure).toBe(true);
  });

  it('should handle secure flag as invalid value', () => {
    process.env.SMTP_SECURE = 'invalid';

    const config = mailConfig();

    expect(config.secure).toBe(false);
  });

  it('should handle port as string number', () => {
    process.env.SMTP_PORT = '2525';

    const config = mailConfig();

    expect(config.port).toBe(2525);
  });

  it('should handle port as invalid string', () => {
    process.env.SMTP_PORT = 'invalid';

    const config = mailConfig();

    expect(config.port).toBeNaN();
  });

  it('should use SMTP_USER as fallback for from.address when SMTP_FROM_EMAIL is not set', () => {
    process.env.SMTP_USER = 'user@example.com';
    delete process.env.SMTP_FROM_EMAIL;

    const config = mailConfig();

    expect(config.from.address).toBe('user@example.com');
  });

  it('should prioritize SMTP_FROM_EMAIL over SMTP_USER for from.address', () => {
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_FROM_EMAIL = 'noreply@example.com';

    const config = mailConfig();

    expect(config.from.address).toBe('noreply@example.com');
  });

  it('should handle partial environment variables', () => {
    process.env.SMTP_HOST = 'smtp.partial.com';
    process.env.SMTP_USER = 'partial@example.com';
    // Other variables remain undefined

    const config = mailConfig();

    expect(config).toEqual({
      host: 'smtp.partial.com',
      port: 587,
      secure: false,
      auth: {
        user: 'partial@example.com',
        pass: undefined,
      },
      from: {
        name: 'NestJS Office',
        address: 'partial@example.com',
      },
    });
  });

  it('should handle empty string environment variables', () => {
    process.env.SMTP_HOST = '';
    process.env.SMTP_PORT = '';
    process.env.SMTP_USER = '';
    process.env.SMTP_PASS = '';
    process.env.SMTP_FROM_NAME = '';
    process.env.SMTP_FROM_EMAIL = '';

    const config = mailConfig();

    expect(config).toEqual({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: '',
        pass: '',
      },
      from: {
        name: 'NestJS Office',
        address: '',
      },
    });
  });
});
