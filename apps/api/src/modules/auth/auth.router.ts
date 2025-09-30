import { Router } from 'express';
import { z } from 'zod';
import { authService } from './auth.service';

export const authRouter = Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const refreshSchema = z.object({ refreshToken: z.string().min(10) });
const otpSchema = z.object({ email: z.string().email() });
const confirmSchema = z.object({ email: z.string().email(), otp: z.string().min(4), newPassword: z.string().min(8) });

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const tokens = await authService.login(email, password);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const tokens = await authService.refresh(refreshToken);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

authRouter.post('/reset/request-otp', async (req, res, next) => {
  try {
    const { email } = otpSchema.parse(req.body);
    const result = await authService.requestPasswordReset(email);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post('/reset/confirm', async (req, res, next) => {
  try {
    const { email, otp, newPassword } = confirmSchema.parse(req.body);
    const result = await authService.confirmPasswordReset(email, otp, newPassword);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
