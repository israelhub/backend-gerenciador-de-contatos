import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

interface ApiInfo {
  message: string;
  version: string;
  status: string;
  timestamp: string;
  endpoints: {
    docs: string;
    health: string;
    auth: string;
    users: string;
    contacts: string;
  };
}

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Informações gerais da API' })
  @ApiResponse({
    status: 200,
    description: 'Informações da API',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        version: { type: 'string' },
        status: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        endpoints: {
          type: 'object',
          properties: {
            docs: { type: 'string' },
            health: { type: 'string' },
            auth: { type: 'string' },
            users: { type: 'string' },
            contacts: { type: 'string' },
          },
        },
      },
    },
  })
  getApiInfo(): ApiInfo {
    return {
      message: 'Gerenciador de Contatos API',
      version: '1.0.0',
      status: 'online',
      timestamp: new Date().toISOString(),
      endpoints: {
        docs: '/docs',
        health: '/api/health',
        auth: '/api/auth',
        users: '/api/users',
        contacts: '/api/contacts',
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Verificar status da aplicação e banco de dados' })
  @ApiResponse({
    status: 200,
    description: 'Status da aplicação',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        database: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', description: 'Uptime em segundos' },
      },
    },
  })
  async check() {
    let databaseStatus = 'error';

    try {
      // Testar conexão com o banco
      await this.dataSource.query('SELECT 1');
      databaseStatus = 'ok';
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    return {
      status: databaseStatus === 'ok' ? 'ok' : 'error',
      database: databaseStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
