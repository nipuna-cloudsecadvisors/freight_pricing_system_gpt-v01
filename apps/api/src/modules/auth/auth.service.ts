import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { prisma } from '../../lib/prisma';
import { appConfig } from '../../config/env';

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw createError(401, 'Invalid credentials');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw createError(401, 'Invalid credentials');
    }
    return this.generateTokens(user.id, user.role, user.email);
  }

  generateTokens(id: string, role: string, email: string) {
    const accessToken = jwt.sign({ id, role, email }, appConfig.jwtSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id, role, email }, appConfig.refreshSecret, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  async refresh(token: string) {
    try {
      const payload = jwt.verify(token, appConfig.refreshSecret) as { id: string; role: string; email: string };
      return this.generateTokens(payload.id, payload.role, payload.email);
    } catch (error) {
      throw createError(401, 'Invalid refresh token');
    }
  }

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { ok: true };
    }
    // TODO: integrate with OTP provider. For now just log.
    // eslint-disable-next-line no-console
    console.info('OTP requested for', email);
    return { ok: true };
  }

  async confirmPasswordReset(email: string, otp: string, newPassword: string) {
    if (!otp) {
      throw createError(400, 'OTP required');
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw createError(404, 'User not found');
    }
    const samePassword = await bcrypt.compare(newPassword, user.password);
    if (samePassword) {
      throw createError(400, 'New password must differ from current password');
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email }, data: { password: hashed } });
    return { ok: true };
  }
}

export const authService = new AuthService();
