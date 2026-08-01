import mongoose from 'mongoose';
import { app } from './app.js';
import { config } from './config.js';

try {
  await mongoose.connect(config.MONGODB_URI);
  app.listen(config.PORT, () => console.log(`API disponible en http://localhost:${config.PORT}`));
} catch (error) {
  console.error('No fue posible iniciar la API:', error);
  process.exit(1);
}
