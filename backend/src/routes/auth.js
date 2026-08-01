import argon2 from 'argon2';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';

export const authRouter = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true });
const credentialsSchema = z.object({
  email: z.email('Ingresa un correo válido.').transform((value) => value.toLowerCase()),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').max(128),
});
const publicUser = (user) => ({ id: user.id, email: user.email, displayName: user.displayName });

function setSession(res, userId) {
  const token = jwt.sign({}, config.JWT_SECRET, { subject: userId, expiresIn: '7d' });
  res.cookie('session', token, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

authRouter.post('/register', authLimiter, async (req, res) => {
  const input = credentialsSchema.extend({ displayName: z.string().trim().min(2).max(80) }).parse(req.body);
  const passwordHash = await argon2.hash(input.password);
  const user = await User.create({ email: input.email, displayName: input.displayName, passwordHash });
  setSession(res, user.id);
  res.status(201).json({ user: publicUser(user) });
});

authRouter.post('/login', authLimiter, async (req, res) => {
  const input = credentialsSchema.parse(req.body);
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
    return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
  }
  setSession(res, user.id);
  return res.json({ user: publicUser(user) });
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie('session', { path: '/' });
  res.status(204).end();
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: 'Usuario no encontrado.' });
  return res.json({ user: publicUser(user) });
});
