import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => ({
  secret: configService.get<string>('JWT_SECRET') || 'default-secret',
  signOptions: {
    expiresIn: '7d',
  },
});

// Refresh token configuration disabled by default
// To enable refresh tokens, uncomment this function and add REFRESH_TOKEN_ENABLED=true to env
// export const getJwtRefreshConfig = (
//   configService: ConfigService,
// ): JwtModuleOptions => ({
//   secret:
//     configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret',
//   signOptions: {
//     expiresIn: '7d',
//   },
// });
