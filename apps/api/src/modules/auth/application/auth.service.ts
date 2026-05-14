import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../../common/prisma.service';
import { WhatsAppService } from '../../../common/whatsapp.service';
import { EmailService } from '../../../common/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly whatsappService: WhatsAppService,
    private readonly emailService: EmailService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    if (user.role === 'patient' && !user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email address first');
    }

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async register(data: { email: string; password: string; name: string; phone?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    
    if (existing) {
      if (existing.isEmailVerified) {
        throw new UnauthorizedException('User already exists');
      }
      
      // If unverified, allow re-registration (update info and send new code)
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const emailVerificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await (this.prisma.user as any).update({
        where: { id: existing.id },
        data: {
          ...data,
          password: hashedPassword,
          emailVerificationCode: verificationCode,
          emailVerificationExpiry,
        },
      });

      await this.emailService.sendOTP(data.email, verificationCode);
      return {
        user: { id: existing.id, email: existing.email, name: data.name, role: existing.role, isEmailVerified: false },
        message: 'Verification code resent'
      };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const emailVerificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await (this.prisma.user as any).create({
      data: {
        ...data,
        password: hashedPassword,
        role: 'patient',
        isEmailVerified: false,
        emailVerificationCode: verificationCode,
        emailVerificationExpiry,
      },
    });

    await this.emailService.sendOTP(data.email, verificationCode);

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, isEmailVerified: user.isEmailVerified },
    };
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');

    const anyUser = user as any;
    if (anyUser.emailVerificationCode !== code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    if (anyUser.emailVerificationExpiry && anyUser.emailVerificationExpiry < new Date()) {
      throw new UnauthorizedException('Verification code has expired');
    }

    await (this.prisma.user as any).update({
      where: { id: user.id },
      data: { 
        isEmailVerified: true, 
        emailVerificationCode: null,
        emailVerificationExpiry: null
      }
    });

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async resendCode(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    const emailVerificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await (this.prisma.user as any).update({
      where: { id: user.id },
      data: { 
        emailVerificationCode: newCode,
        emailVerificationExpiry 
      }
    });

    return this.emailService.sendOTP(email, newCode);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role };
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; currentPassword?: string; newPassword?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;

    if (data.currentPassword && data.newPassword) {
      const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isPasswordValid) throw new UnauthorizedException('Invalid current password');
      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, phone: updatedUser.phone, role: updatedUser.role };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const passwordResetExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await (this.prisma.user as any).update({
      where: { id: user.id },
      data: { 
        passwordResetCode: resetCode,
        passwordResetExpiry: passwordResetExpiry
      },
    });

    await this.emailService.sendOTP(email, resetCode);
    return { message: 'Reset code sent to your email' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');

    const anyUser = user as any;
    if (anyUser.passwordResetCode !== code) {
      throw new UnauthorizedException('Invalid reset code');
    }

    if (anyUser.passwordResetExpiry && anyUser.passwordResetExpiry < new Date()) {
      throw new UnauthorizedException('Reset code has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await (this.prisma.user as any).update({
      where: { id: user.id },
      data: { 
        password: hashedPassword, 
        passwordResetCode: null,
        passwordResetExpiry: null
      },
    });

    return { message: 'Password reset successfully' };
  }
  async generateTokens(user: { id: string; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    
    const refreshToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await (this.prisma as any).refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    const token = await (this.prisma as any).refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!token || token.expiresAt < new Date()) {
      if (token) await (this.prisma as any).refreshToken.delete({ where: { id: token.id } });
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await (this.prisma as any).refreshToken.delete({ where: { id: token.id } });
    return this.generateTokens(token.user);
  }

  async getUsers(role?: string) {
    const whereClause = role ? { role } : {};
    const users = await this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return users;
  }
}
