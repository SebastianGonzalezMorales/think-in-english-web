import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI es obligatoria'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
});

export const config = schema.parse(process.env);
