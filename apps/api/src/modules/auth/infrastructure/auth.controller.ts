import { Controller, Post, Get, Delete, Param, Body, UseGuards, Req, Res, UnauthorizedException, Query } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { RolesGuard, Roles } from '../../../common/decorators';
import { AuthService } from '../application/auth.service';

const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days - matches DB expiry

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_COOKIE_MAX_AGE,
      path: '/',
    });
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.login(body.email, body.password);
    this.setRefreshCookie(res, data.refreshToken);
    return { accessToken: data.accessToken, user: data.user };
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('register')
  async register(@Body() body: { email: string; password: string; name: string; phone?: string; method?: 'email' | 'whatsapp' }) {
    return this.authService.register(body);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { email: string; code: string }, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.verifyEmail(body.email, body.code);
    this.setRefreshCookie(res, data.refreshToken);
    return { accessToken: data.accessToken, user: data.user };
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('resend-code')
  async resendCode(@Body() body: { email: string; method?: 'email' | 'whatsapp' }) {
    return this.authService.resendCode(body.email, body.method);
  }

  @SkipThrottle()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @Get('users')
  async getUsers(@Query('role') role?: string) {
    return this.authService.getUsers(role);
  }

  @SkipThrottle()
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async profile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @SkipThrottle()
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

  @Throttle({ default: { limit: 3, ttl: 300000 } })
  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; code: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.code, body.newPassword);
  }

  @SkipThrottle()
  @Post('refresh')
  async refresh(@Req() req: Request, @Body() body: { refreshToken?: string }, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken || body.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    const data = await this.authService.refreshAccessToken(refreshToken);
    this.setRefreshCookie(res, data.refreshToken);
    return { accessToken: data.accessToken };
  }

  @SkipThrottle()
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await this.authService.invalidateRefreshToken(refreshToken);
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    return { message: 'Logged out successfully' };
  }

  @SkipThrottle()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @Get('users/:id/profile')
  async getUserFullProfile(@Param('id') id: string) {
    return this.authService.getUserFullProfile(id);
  }

  @SkipThrottle()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @Post('users/:id/notes')
  async addPatientNote(@Param('id') id: string, @Body() body: { content: string }) {
    return this.authService.addPatientNote(id, body.content);
  }

  @SkipThrottle()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @Delete('users/notes/:noteId')
  async deletePatientNote(@Param('noteId') noteId: string) {
    return this.authService.deletePatientNote(noteId);
  }

  @SkipThrottle()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }
}
