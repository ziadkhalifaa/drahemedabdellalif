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

  async register(data: { email: string; password: string; name: string; phone?: string; method?: 'email' | 'whatsapp' }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    const method = data.method || 'email';
    
    if (existing) {
      if (existing.isEmailVerified) {
        throw new UnauthorizedException('User already exists');
      }
      
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const emailVerificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      const { method: _, ...updateData } = data;
      await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          ...updateData,
          password: hashedPassword,
          emailVerificationCode: verificationCode,
          emailVerificationExpiry,
        },
      });

      try {
        if (method === 'whatsapp' && data.phone) {
          await this.whatsappService.sendOTP(data.phone, verificationCode);
        } else {
          await this.emailService.sendOTP(data.email, verificationCode);
        }
      } catch (notifyErr) {
        // Notification failed but user record is updated — they can request resend
      }

      return {
        user: { id: existing.id, email: existing.email, name: data.name, role: existing.role, isEmailVerified: false },
        message: 'Verification code resent'
      };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: 'patient',
        isEmailVerified: false,
        emailVerificationCode: verificationCode,
        emailVerificationExpiry,
      },
    });

    try {
      if (method === 'whatsapp' && data.phone) {
        await this.whatsappService.sendOTP(data.phone, verificationCode);
      } else {
        await this.emailService.sendOTP(data.email, verificationCode);
      }
    } catch (notifyErr) {
      // Notification failed but user is created — they can request resend from verify screen
    }

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, isEmailVerified: user.isEmailVerified },
    };
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');

    if (user.emailVerificationCode !== code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
      throw new UnauthorizedException('Verification code has expired');
    }

    await this.prisma.user.update({
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

  async resendCode(email: string, method: 'email' | 'whatsapp' = 'email') {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        emailVerificationCode: newCode,
        emailVerificationExpiry 
      }
    });

    if (method === 'whatsapp' && user.phone) {
      return this.whatsappService.sendOTP(user.phone, newCode);
    }
    return this.emailService.sendOTP(email, newCode);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      phone: user.phone, 
      role: user.role,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      address: user.address
    };
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; gender?: string; dateOfBirth?: string; address?: string; currentPassword?: string; newPassword?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.gender) updateData.gender = data.gender;
    if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth);
    if (data.address) updateData.address = data.address;

    if (data.currentPassword && data.newPassword) {
      const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isPasswordValid) throw new UnauthorizedException('Invalid current password');
      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return { 
      id: updatedUser.id, 
      email: updatedUser.email, 
      name: updatedUser.name, 
      phone: updatedUser.phone, 
      role: updatedUser.role,
      gender: updatedUser.gender,
      dateOfBirth: updatedUser.dateOfBirth,
      address: updatedUser.address
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const passwordResetExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await this.prisma.user.update({
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

    if (user.passwordResetCode !== code) {
      throw new UnauthorizedException('Invalid reset code');
    }

    if (user.passwordResetExpiry && user.passwordResetExpiry < new Date()) {
      throw new UnauthorizedException('Reset code has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
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
    await this.prisma.refreshToken.create({
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
    try {
      const token = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!token || token.expiresAt < new Date()) {
        if (token) {
          await this.prisma.refreshToken.delete({ where: { id: token.id } }).catch(() => {});
        }
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      await this.prisma.refreshToken.delete({ where: { id: token.id } }).catch(() => {});
      return this.generateTokens(token.user);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getUsers(role?: string) {
    const whereClause = role ? { role: role as any } : {};
    const users = await this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        gender: true,
        dateOfBirth: true,
        address: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return users;
  }

  async deleteUser(userId: string) {
    await this.prisma.$transaction(async (tx) => {
      // 1. Delete prescriptions
      await tx.prescription.deleteMany({ where: { patientId: userId } });

      // 2. Delete payments
      await tx.payment.deleteMany({ where: { userId } });

      // 3. Delete medical reports
      await tx.medicalReport.deleteMany({ where: { patientId: userId } });

      // 4. Delete audit logs
      await tx.auditLog.deleteMany({ where: { userId } });

      // 5. Delete appointment reviews connected to patient appointments
      await tx.appointmentReview.deleteMany({
        where: {
          appointment: {
            patientId: userId,
          },
        },
      });

      // 6. Delete appointments
      await tx.appointment.deleteMany({ where: { patientId: userId } });

      // 7. Delete refresh tokens
      await tx.refreshToken.deleteMany({ where: { userId } });

      // 8. Finally delete the user
      await tx.user.delete({ where: { id: userId } });
    });

    return { message: 'User and all associated data deleted successfully' };
  }
}
