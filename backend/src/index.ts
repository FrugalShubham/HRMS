import mongoose from 'mongoose';
import app from './app';
import { env } from './config/env';

async function bootstrap() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('MongoDB connected');

  app.listen(env.PORT, () => {
    console.log(`HRFlow API running on port ${env.PORT}`);
    console.log(`API: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
