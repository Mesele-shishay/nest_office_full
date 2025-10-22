import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { passwordResetTemplate } from './templates/password-reset.template';
import { welcomeTemplate } from './templates/welcome.template';
import { managerCredentialsTemplate } from './templates/manager-credentials.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: this.configService.get<boolean>('mail.secure'),
      auth: {
        user: this.configService.get<string>('mail.auth.user'),
        pass: this.configService.get<string>('mail.auth.pass'),
      },
    });

    // Verify SMTP connection on initialization
    void this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('✅ SMTP connection verified successfully');
    } catch (error) {
      this.logger.error(
        '❌ SMTP connection failed. Please check your email configuration.',
        error,
      );
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    firstName?: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${resetToken}`;
    const fromName = this.configService.get<string>('mail.from.name');
    const fromEmail = this.configService.get<string>('mail.from.address');

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: 'Password Reset Request',
        html: passwordResetTemplate(resetUrl, firstName),
      });

      this.logger.log(`Password reset email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error,
      );
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
    const fromName = this.configService.get<string>('mail.from.name');
    const fromEmail = this.configService.get<string>('mail.from.address');

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: 'Welcome to Our Platform! 🎉',
        html: welcomeTemplate(firstName),
      });

      this.logger.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}`, error);
      throw new Error('Failed to send welcome email');
    }
  }

  async sendManagerCredentials(
    email: string,
    password: string,
    officeName: string,
    firstName?: string,
  ): Promise<void> {
    const fromName = this.configService.get<string>('mail.from.name');
    const fromEmail = this.configService.get<string>('mail.from.address');

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: 'Office Manager Account Created - Login Credentials',
        html: managerCredentialsTemplate(
          email,
          password,
          officeName,
          firstName,
        ),
      });

      this.logger.log(
        `Manager credentials email sent successfully to ${email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send manager credentials email to ${email}`,
        error,
      );
      throw new Error('Failed to send manager credentials email');
    }
  }
}
