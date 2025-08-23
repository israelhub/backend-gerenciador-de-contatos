/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

import { AppModule } from './../src/app.module';

interface AuthResponse {
  user: {
    id: string;
    nome: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface ContactResponse {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactsListResponse {
  contacts: ContactResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = app.get(DataSource);

    // Configure app like in main.ts (simplified)
    app.setGlobalPrefix('api');

    await app.init();
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
    await app.close();
  });

  describe('Health Check', () => {
    it('/api/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('database');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
        });
    });
  });

  describe('Authentication Flow', () => {
    let accessToken: string;
    let refreshToken: string;
    const testUser = {
      nome: 'Teste E2E',
      email: `teste-e2e-${Date.now()}@teste.com`,
      senha: 'senha123',
    };

    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe(testUser.email);
          expect(res.body.user).not.toHaveProperty('senha');

          accessToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
        });
    });

    it('should not register user with existing email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          senha: testUser.senha,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should not login with incorrect credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          senha: 'senhaErrada',
        })
        .expect(401);
    });

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(testUser.email);
          expect(res.body).not.toHaveProperty('senha');
        });
    });

    it('should not get user profile without token', () => {
      return request(app.getHttpServer()).get('/api/users/me').expect(401);
    });

    it('should create a contact', () => {
      const contactData = {
        nome: 'Contato Teste',
        email: 'contato@teste.com',
        telefone: '11999999999',
        categoria: 'pessoal',
      };

      return request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(contactData)
        .expect(201)
        .expect((res) => {
          expect(res.body.nome).toBe(contactData.nome);
          expect(res.body.email).toBe(contactData.email);
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('ownerId');
        });
    });

    it('should list contacts', () => {
      return request(app.getHttpServer())
        .get('/api/contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('contacts');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.contacts)).toBe(true);
        });
    });

    it('should reject contact without telefone', () => {
      const contactData = {
        nome: 'Contato Sem Telefone',
        email: 'sem-telefone@teste.com',
        categoria: 'pessoal',
      };

      return request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(contactData)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Validation failed');
          expect(res.body.fields).toHaveProperty('telefone');
        });
    });

    it('should reject contact with invalid telefone format', () => {
      const contactData = {
        nome: 'Contato Telefone Inválido',
        email: 'invalido@teste.com',
        telefone: '123456', // Menos de 11 dígitos
        categoria: 'pessoal',
      };

      return request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(contactData)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Validation failed');
          expect(res.body.fields).toHaveProperty('telefone');
        });
    });
  });
});
