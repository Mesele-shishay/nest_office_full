import { Test, TestingModule } from '@nestjs/testing';
import { MailModule } from './mail.module';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';

describe('MailModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [MailModule],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide MailService', () => {
    const mailService = module.get<MailService>(MailService);
    expect(mailService).toBeDefined();
    expect(mailService).toBeInstanceOf(MailService);
  });

  it('should export MailService', () => {
    const mailService = module.get<MailService>(MailService);
    expect(mailService).toBeDefined();
  });

  it('should import ConfigModule', () => {
    const configModule = module.get(ConfigModule);
    expect(configModule).toBeDefined();
  });
});
