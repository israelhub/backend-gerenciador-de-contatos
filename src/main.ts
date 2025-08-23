import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { seedData } from './database/seeds/seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get configuration service
  const configService = app.get(ConfigService);

  // Run automatic database seeding
  const shouldRunSeeds =
    configService.get('NODE_ENV') !== 'production' ||
    configService.get('RUN_SEEDS') === 'true';

  if (shouldRunSeeds) {
    try {
      const dataSource = app.get(DataSource);
      console.log('🌱 Executando seeds automáticas...');
      await seedData(dataSource);
      console.log('✅ Seeds executadas com sucesso!');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      console.log('ℹ️ Seeds já existem ou erro esperado:', message);
    }
  }

  // Security middleware - Helmet com configurações para CORS
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS
  app.enableCors({
    origin: configService.get<string | string[]>('app.corsOrigins'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global prefix
  app.setGlobalPrefix('api', {
    exclude: ['/'], // Excluir rota raiz do prefixo global
  });

  // Class serializer interceptor for @Exclude decorators
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Swagger documentation (habilitado por flag)
  if (configService.get('app.enableSwagger')) {
    const config = new DocumentBuilder()
      .setTitle('Gerenciador de Contatos API')
      .setDescription('API REST para gerenciamento de usuários e contatos')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Authentication', 'Endpoints de autenticação')
      .addTag('Users', 'Endpoints de usuários')
      .addTag('Contacts', 'Endpoints de contatos')
      .addTag('Health', 'Health check')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = configService.get<number>('app.port') || 8000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  if (configService.get('app.enableSwagger')) {
    console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
  }
}

void bootstrap();
