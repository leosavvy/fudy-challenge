import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';

describe('Given /v1 path', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('Given /auth path', () => {
    describe.only('/register', () => {
      describe('Given not-strong password', () => {
        it('should return 400 Bad request response', async () => {
          return request(app.getHttpServer()).post('/v1/auth/register').expect(400);
        });
      });
    });
    // describe('Given /login path', () => {
    //   describe('Given wrong password', () => {
    //     it('should return 401 Unauthorized response', async () => {
    //       const response = await request(app.getHttpServer()).post('/v1/auth/login').send({
    //         email: 'test@example.com',
    //         password: 'wrongpassword',
    //       });

    //       expect(response.status).toBe(401);
    //     });
    //   });
    // });
    // describe('Given /me patch', () => {
    //   describe('Given a valid JWT token', () => {
    //     it('should return 200 OK and user information', async () => {
    //       // Assuming we have a valid token, this should be replaced by a real token.
    //       const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

    //       const response = await request(app.getHttpServer())
    //         .get('/v1/auth/me')
    //         .set('Authorization', `Bearer ${validToken}`);

    //       expect(response.status).toBe(200);
    //       expect(response.body).toHaveProperty('email');
    //     });
    //   });
    //   describe('Given an invalid JWT token', () => {
    //     it('should return 401 Unauthorized response', async () => {
    //       // Assuming we have an invalid token
    //       const invalidToken = 'invalidToken';

    //       const response = await request(app.getHttpServer())
    //         .get('/v1/auth/me')
    //         .set('Authorization', `Bearer ${invalidToken}`);

    //       expect(response.status).toBe(401);
    //     });
    //   });
    // });
  });

  afterAll(async () => {
    await app.close();
  });
});
