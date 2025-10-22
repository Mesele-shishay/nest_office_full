import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SmsService } from './services/sms.service';
import { PhoneVerificationService } from './services/phone-verification.service';

@Module({
  imports: [HttpModule],
  providers: [SmsService, PhoneVerificationService],
  exports: [SmsService, PhoneVerificationService],
})
export class CommonServicesModule {}
