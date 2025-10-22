import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  HttpCode,
  HttpStatus,
  Version,
  Type,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  AuthResponseDto,
  UserProfileResponseDto,
  RegisterDto,
  SendPhoneVerificationDto,
  VerifyPhoneDto,
  ApproveUserDto,
} from './dto/auth.dto';
import { User } from '../users/entities/user.entity';
import { ApiStandardResponses } from '../common/decorators/api-response.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login successful')
  @ApiOperation({
    summary: '🌐 [Public] User login',
    description:
      '**No Authentication Required**\n\nAuthenticates a user with email and password. Returns JWT access and refresh tokens.\n\n**Default Admin Credentials:**\n- Email: `admin@tugza.tech`\n- Password: `Admin@123456`\n\n',
  })
  @ApiBody({ type: LoginDto })
  @ApiStandardResponses(AuthResponseDto as Type<unknown>, {
    status: 200,
    description: 'Login successful',
    message: 'Login successful',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Refresh token endpoint removed - using JWT only
  // To re-enable refresh tokens, uncomment this endpoint and add REFRESH_TOKEN_ENABLED=true to env
  // @Post('refresh')
  // @Version('1')
  // @ApiBearerAuth('JWT-auth')
  // @HttpCode(HttpStatus.OK)
  // @ResponseMessage('Token refreshed successfully')
  // @ApiOperation({
  //   summary: '🔓 [Authenticated] Refresh access token',
  //   description:
  //     '**Authentication Required**\n\nGenerates a new access token and refresh token using the current JWT token.',
  // })
  // @ApiStandardResponses(AuthResponseDto as Type<unknown>, {
  //   status: 200,
  //   description: 'Token refreshed successfully',
  //   message: 'Token refreshed successfully',
  // })
  // async refresh(@Request() req: { user: User }) {
  //   return this.authService.refreshToken(req.user.id);
  // }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('If the email exists, a reset link has been sent')
  @ApiOperation({
    summary: '🌐 [Public] Request password reset',
    description:
      '**No Authentication Required**\n\nSends a password reset link to the provided email address. Email is sent only if the account exists.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiStandardResponses(undefined, {
    status: 200,
    description: 'Password reset email sent if account exists',
    message: 'If the email exists, a reset link has been sent',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto);
    return { message: 'If the email exists, a reset link has been sent' };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Password reset successfully')
  @ApiOperation({
    summary: '🌐 [Public] Reset password',
    description:
      '**No Authentication Required**\n\nResets the user password using the reset token sent via email.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiStandardResponses(AuthResponseDto as Type<unknown>, {
    status: 200,
    description: 'Password reset successful; tokens returned',
    message: 'Password reset successfully',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const tokens = await this.authService.resetPassword(resetPasswordDto);
    return tokens;
  }

  @Public()
  @Get('validate-reset-token')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Token validation result')
  @ApiOperation({
    summary: '🌐 [Public] Validate reset token',
    description:
      '**No Authentication Required**\n\nValidates if a password reset token is valid and not expired.',
  })
  @ApiStandardResponses(undefined, {
    status: 200,
    description: 'Token validation successful',
    message: 'Token is valid',
  })
  async validateResetToken(@Query('token') token: string) {
    const isValid = await this.authService.validateResetToken(token);
    return {
      valid: isValid,
      message: isValid ? 'Token is valid' : 'Invalid or expired token',
    };
  }

  @Post('change-password')
  @Version('1')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Password changed successfully')
  @ApiOperation({
    summary: '🔓 [Authenticated] Change user password',
    description:
      '**Authentication Required**\n\nChanges the user password. Requires current password verification and new password confirmation.',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiStandardResponses(undefined, {
    status: 200,
    description: 'Password changed successfully',
    message: 'Password changed successfully',
  })
  async changePassword(
    @Request() req: { user: User },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(req.user.id, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Get('me')
  @Version('1')
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('User profile retrieved successfully')
  @ApiOperation({
    summary: '🔓 [Authenticated] Get current user profile',
    description:
      '**Authentication Required**\n\nRetrieves the profile information of the currently authenticated user.',
  })
  @ApiStandardResponses(UserProfileResponseDto as Type<unknown>, {
    status: 200,
    description: 'User profile retrieved successfully',
    message: 'User profile retrieved successfully',
  })
  getProfile(@Request() req: { user: User }) {
    return req.user;
  }

  @Public()
  @Post('register')
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Registration successful')
  @ApiOperation({
    summary: '🌐 [Public] User registration',
    description:
      '**No Authentication Required**\n\nRegister a new user account. User will be inactive until admin approval and phone verification.\n\n**Required fields for public registration:**\n- email, firstName, lastName, phone, password, nationalIdPhoto\n\n**Automatic SMS verification:**\nA verification code will be automatically sent to the provided phone number.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiStandardResponses(undefined, {
    status: 201,
    description: 'Registration successful',
    message:
      'Registration successful. A verification code has been sent to your phone. Please verify your phone number and wait for admin approval.',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('register-user')
  @Version('1')
  @ApiBearerAuth('JWT-auth')
  @Roles('MANAGER', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('User registered successfully by manager')
  @ApiOperation({
    summary: '🔓 [Manager/Admin] Register user with default settings',
    description:
      '**Authentication Required - Manager/Admin Only**\n\nRegister a new user account with manager privileges. User will be active immediately with phone verified by default.\n\n**Optional fields:**\n- password (uses default if not provided)\n- nationalIdPhoto (optional)\n- role (defaults to USER)\n- skipPhoneVerification (defaults to true)',
  })
  @ApiBody({ type: RegisterDto })
  @ApiStandardResponses(undefined, {
    status: 201,
    description: 'User registered successfully by manager',
    message:
      'User registered successfully by manager. User is active and ready to use.',
  })
  async registerUser(
    @Request() req: { user: User },
    @Body() registerDto: RegisterDto,
  ) {
    return this.authService.register(registerDto, req.user);
  }

  @Public()
  @Post('send-phone-verification')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Verification code sent successfully')
  @ApiOperation({
    summary: '🌐 [Public] Send phone verification code',
    description:
      "**No Authentication Required**\n\nSend a verification code to the user's phone number.",
  })
  @ApiBody({ type: SendPhoneVerificationDto })
  @ApiStandardResponses(undefined, {
    status: 200,
    description: 'Verification code sent successfully',
    message: 'Verification code sent successfully',
  })
  async sendPhoneVerification(
    @Body() sendPhoneVerificationDto: SendPhoneVerificationDto,
  ) {
    return this.authService.sendPhoneVerificationCode(sendPhoneVerificationDto);
  }

  @Public()
  @Post('verify-phone')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Phone number verified successfully')
  @ApiOperation({
    summary: '🌐 [Public] Verify phone number',
    description:
      '**No Authentication Required**\n\nVerify the phone number using the verification code sent via SMS.',
  })
  @ApiBody({ type: VerifyPhoneDto })
  @ApiStandardResponses(undefined, {
    status: 200,
    description: 'Phone number verified successfully',
    message: 'Phone number verified successfully',
  })
  async verifyPhone(@Body() verifyPhoneDto: VerifyPhoneDto) {
    return this.authService.verifyPhone(verifyPhoneDto);
  }

  @Post('approve-user')
  @Version('1')
  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User approved successfully')
  @ApiOperation({
    summary: '🔓 [Admin] Approve user registration',
    description:
      '**Authentication Required - Admin Only**\n\nApprove a pending user registration. User must have verified their phone number.',
  })
  @ApiBody({ type: ApproveUserDto })
  @ApiStandardResponses(undefined, {
    status: 200,
    description: 'User approved successfully',
    message: 'User approved successfully',
  })
  async approveUser(
    @Request() req: { user: User },
    @Body() approveUserDto: ApproveUserDto,
  ) {
    return this.authService.approveUser(approveUserDto.userId, req.user.id);
  }

  @Get('pending-users')
  @Version('1')
  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN')
  @ResponseMessage('Pending users retrieved successfully')
  @ApiOperation({
    summary: '🔓 [Admin] Get pending user registrations',
    description:
      '**Authentication Required - Admin Only**\n\nRetrieve all users pending admin approval who have verified their phone numbers.',
  })
  @ApiStandardResponses(undefined, {
    status: 200,
    description: 'Pending users retrieved successfully',
    message: 'Pending users retrieved successfully',
  })
  async getPendingUsers() {
    return this.authService.getPendingUsers();
  }

  @Get('test-sms')
  @Version('1')
  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN')
  @ResponseMessage('SMS service test completed')
  @ApiOperation({
    summary: '🔓 [Admin] Test SMS service connectivity',
    description:
      '**Authentication Required - Admin Only**\n\nTest the SMS service connectivity and configuration.',
  })
  @ApiStandardResponses(undefined, {
    status: 200,
    description: 'SMS service test completed',
    message: 'SMS service test completed',
  })
  async testSmsService() {
    return this.authService.testSmsService();
  }
}
