import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContactsModule } from './contacts/contacts.module';
import { HealthModule } from './health/health.module';

// Configurations
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';

// Entities
import { User } from './users/entities/user.entity';
import { Contact } from './contacts/entities/contact.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';

// Common
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig],
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('database.url'),
        entities: [User, Contact, RefreshToken],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 10, // 10 requests
      },
    ]),

    // Application Modules
    AuthModule,
    UsersModule,
    ContactsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          transformOptions: {
            enableImplicitConversion: true,
          },
        }),
    },
  ],
})
export class AppModule {}
