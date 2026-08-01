import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function requireAuth(req, res, next) {
  const token = req.cookies.session;
  if (!token) return res.status(401).json({ message: 'Debes iniciar sesión.' });
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ message: 'La sesión expiró o no es válida.' });
  }
}
