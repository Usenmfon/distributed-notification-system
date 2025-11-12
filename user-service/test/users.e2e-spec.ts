import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

   app.useGlobalFilters(new AllExceptionsFilter());


    await app.init();

    // Get the DataSource instance
    dataSource = app.get(DataSource);
  });

  // Clean database before each test
  beforeEach(async () => {
    if (dataSource && dataSource.isInitialized) {
      // Drop all tables and recreate
      await dataSource.synchronize(true);
    }
  });

  afterAll(async () => {
    // Close connections properly
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('service', 'user-service');
          expect(res.body).toHaveProperty('database');
        });
    });
  });

  describe('/api/v1/users (POST)', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          name: 'E2E Test User',
          email: 'e2e@example.com',
          password: 'password123',
          preferences: {
            email: true,
            push: true,
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.email).toBe('e2e@example.com');
          expect(res.body.data).not.toHaveProperty('password');
          userId = res.body.data.id;
        });
    });

    it('should fail with duplicate email', async () => {
      // First, create a user
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          name: 'First User',
          email: 'duplicate@example.com',
          password: 'password123',
          preferences: {
            email: true,
            push: true,
          },
        })
        .expect(201);

      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          name: 'Duplicate User',
          email: 'duplicate@example.com',
          password: 'password123',
          preferences: {
            email: true,
            push: true,
          },
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.success).toBe(false);
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          name: 'Invalid Email User',
          email: 'not-an-email',
          password: 'password123',
          preferences: {
            email: true,
            push: true,
          },
        })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          name: 'Short Password User',
          email: 'short@example.com',
          password: '123',
          preferences: {
            email: true,
            push: true,
          },
        })
        .expect(400);
    });
  });

  describe('/api/v1/auth/login (POST)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          name: 'Login Test User',
          email: 'login@example.com',
          password: 'password123',
          preferences: {
            email: true,
            push: true,
          },
        });
    });

    it('should login successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('access_token');
          expect(res.body.data).toHaveProperty('user');
          authToken = res.body.data.access_token;
        });
    });

    it('should fail with wrong password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail with non-existent user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('/api/v1/users (GET)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          name: 'Auth Test User',
          email: 'auth@example.com',
          password: 'password123',
          preferences: {
            email: true,
            push: true,
          },
        });

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'auth@example.com',
          password: 'password123',
        });

      authToken = loginRes.body.data.access_token;
    });

    it('should get all users with auth', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.meta).toHaveProperty('total');
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('limit');
        });
    });

    it('should fail without auth', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users')
        .expect(401);
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(5);
        });
    });
  });

  describe('/api/v1/users/:id (PATCH)', () => {
    beforeEach(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          name: 'Update Test',
          email: 'update@example.com',
          password: 'password123',
          preferences: {
            email: true,
            push: true,
          },
        });

      userId = createRes.body.data.id;

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'update@example.com',
          password: 'password123',
        });

      authToken = loginRes.body.data.access_token;
    });

    it('should update user', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          preferences: {
            email: false,
            push: true,
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toBe('Updated Name');
          expect(res.body.data.preferences.email).toBe(false);
        });
    });
  });

  describe('/api/v1/users/:id (DELETE)', () => {
    beforeEach(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          name: 'Delete Test',
          email: 'delete@example.com',
          password: 'password123',
          preferences: {
            email: true,
            push: true,
          },
        });

      userId = createRes.body.data.id;

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'delete@example.com',
          password: 'password123',
        });

      authToken = loginRes.body.data.access_token;
    });

    it('should delete user', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toContain('deleted');
        });
    });
  });
});