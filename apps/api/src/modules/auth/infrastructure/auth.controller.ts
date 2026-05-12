import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../application/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  async register(@Body() body: { email: string; password: string; name: string; phone?: string }) {
    return this.authService.register(body);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { email: string; code: string }) {
    return this.authService.verifyEmail(body.email, body.code);
  }

  @Post('resend-code')
  async resendCode(@Body() body: { email: string }) {
    return this.authService.resendCode(body.email);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async profile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  async updateProfile(@Req() req: any, @Body() body: any) {
    return this.authService.updateProfile(req.user.id, body);
  }

  @Throttle({ default: { limit: 3, ttl: 300000 } })
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; code: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.code, body.newPassword);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }
}
