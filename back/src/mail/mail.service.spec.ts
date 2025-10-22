import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('MailService', () => {
  let service: MailService;
  let configService: ConfigService;
  let mockTransporter: any;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    // Create mock transporter
    mockTransporter = {
      verify: jest.fn().mockResolvedValue(true),
      sendMail: jest.fn(),
    };

    // Mock nodemailer.createTransporter
    const nodemailer = require('nodemailer');
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);

    // Suppress logger output during tests
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create transporter with correct configuration', () => {
      const nodemailer = require('nodemailer');
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: undefined,
        port: undefined,
        secure: undefined,
        auth: {
          user: undefined,
          pass: undefined,
        },
      });
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('sendPasswordResetEmail', () => {
    const email = 'test@example.com';
    const resetToken = 'reset-token-123';
    const firstName = 'John';

    beforeEach(() => {
      mockConfigService.get
        .mockReturnValueOnce('http://localhost:3000') // FRONTEND_URL
        .mockReturnValueOnce('Test App') // mail.from.name
        .mockReturnValueOnce('noreply@testapp.com'); // mail.from.address
    });

    it('should send password reset email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendPasswordResetEmail(email, resetToken, firstName);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"Test App" <noreply@testapp.com>',
        to: email,
        subject: 'Password Reset Request',
        html: expect.any(String),
      });
    });

    it('should use default frontend URL when not configured', async () => {
      mockConfigService.get
        .mockReturnValueOnce(undefined) // FRONTEND_URL
        .mockReturnValueOnce('Test App') // mail.from.name
        .mockReturnValueOnce('noreply@testapp.com'); // mail.from.address

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendPasswordResetEmail(email, resetToken, firstName);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('http://localhost:3000/reset-password'),
        }),
      );
    });

    it('should include reset token in email URL', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendPasswordResetEmail(email, resetToken, firstName);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(`token=${resetToken}`),
        }),
      );
    });

    it('should throw error when email sending fails', async () => {
      const error = new Error('SMTP Error');
      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(
        service.sendPasswordResetEmail(email, resetToken, firstName),
      ).rejects.toThrow('Failed to send password reset email');
    });

    it('should work without firstName parameter', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendPasswordResetEmail(email, resetToken);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.any(String),
        }),
      );
    });
  });

  describe('sendWelcomeEmail', () => {
    const email = 'test@example.com';
    const firstName = 'John';

    beforeEach(() => {
      mockConfigService.get
        .mockReturnValueOnce('Test App') // mail.from.name
        .mockReturnValueOnce('noreply@testapp.com'); // mail.from.address
    });

    it('should send welcome email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendWelcomeEmail(email, firstName);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"Test App" <noreply@testapp.com>',
        to: email,
        subject: 'Welcome to Our Platform! 🎉',
        html: expect.any(String),
      });
    });

    it('should throw error when email sending fails', async () => {
      const error = new Error('SMTP Error');
      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(service.sendWelcomeEmail(email, firstName)).rejects.toThrow(
        'Failed to send welcome email',
      );
    });

    it('should work without firstName parameter', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendWelcomeEmail(email);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.any(String),
        }),
      );
    });
  });

  describe('verifyConnection', () => {
    it('should log success when connection is verified', async () => {
      const loggerSpy = jest
        .spyOn(service['logger'], 'log')
        .mockImplementation();
      mockTransporter.verify.mockResolvedValue(true);

      await service['verifyConnection']();

      expect(loggerSpy).toHaveBeenCalledWith(
        '✅ SMTP connection verified successfully',
      );
    });

    it('should log error when connection verification fails', async () => {
      const loggerSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation();
      const error = new Error('Connection failed');
      mockTransporter.verify.mockRejectedValue(error);

      await service['verifyConnection']();

      expect(loggerSpy).toHaveBeenCalledWith(
        '❌ SMTP connection failed. Please check your email configuration.',
        error,
      );
    });
  });
});
