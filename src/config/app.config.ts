import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins:
    process.env.CORS_ORIGINS === '*'
      ? '*'
      : process.env.CORS_ORIGINS?.split(',') || ['http://localhost:8000'],
  throttleTtl: parseInt(process.env.THROTTLE_TTL || '60', 10),
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
  enableSwagger:
    process.env.ENABLE_SWAGGER === 'true' ||
    (process.env.NODE_ENV || 'development') === 'development',
}));
