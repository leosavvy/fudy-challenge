import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { SWAGGER_PASSWORD_EXAMPLE } from '../../common/swagger/constants/password.example';
import { Prisma } from '../../domain/persistence/prisma/prisma.service';

describe('Given /v1 path', () => {
  let app: INestApplication;
  let prismaService: Prisma;
  const mockEmail = 'jack.sparrow234@captain.pearl';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prismaService = moduleFixture.get<Prisma>(Prisma);
    await app.init();
  });

  afterEach(async () => {
    const mockUser = await prismaService.user.findUnique({ where: { email: mockEmail } });

    if (mockUser) {
      await prismaService.user.delete({ where: { email: mockEmail } });
    }
  });

  describe('Given /auth path', () => {
    describe('Given /login path', () => {
      describe('Given non-existent user', () => {
        it('should return 401 Unauthorized response', async () => {
          await request(app.getHttpServer())
            .post('/auth/login')
            .send({
              email: 'jackie.not.sparrowie@caribe.pearl',
              password: '123456',
            })
            .expect(401);
        });
      });

      describe('Given wrong password', () => {
        it('should return 401 Unauthorized response', async () => {
          await request(app.getHttpServer()).post('/auth/register').send({
            email: mockEmail,
            password: SWAGGER_PASSWORD_EXAMPLE,
          });
          const response = await request(app.getHttpServer()).post('/auth/login').send({
            email: mockEmail,
            password: 'wrongpassword',
          });

          expect(response.status).toBe(401);
        });
      });
    });

    describe('Given /me path', () => {
      describe('Given a valid JWT token', () => {
        it('should return 200 OK and user information', async () => {
          await request(app.getHttpServer()).post('/user/register').send({
            email: mockEmail,
            password: SWAGGER_PASSWORD_EXAMPLE,
          });

          const responseLogin = await request(app.getHttpServer()).post('/auth/login').send({
            email: mockEmail,
            password: SWAGGER_PASSWORD_EXAMPLE,
          });

          const validToken = responseLogin.text;

          const response = await request(app.getHttpServer())
            .get('/auth/me')
            .set('Authorization', `Bearer ${validToken}`);

          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('email');

          await prismaService.user.delete({ where: { email: mockEmail } });
        });
      });
      describe('Given an invalid JWT token', () => {
        it('should return 401 Unauthorized response', async () => {
          const invalidToken = 'invalidToken';

          const response = await request(app.getHttpServer())
            .get('/auth/me')
            .set('Authorization', `Bearer ${invalidToken}`);

          expect(response.status).toBe(401);
        });
      });
    });
  });

  describe('Given /user path', () => {
    describe('Given /register path', () => {
      describe('Given not valid body', () => {
        it('should return 400 Bad request response', async () => {
          return request(app.getHttpServer()).post('/user/register').expect(400);
        });
      });
      describe('Given not-strong password', () => {
        it('should return 400 Bad request response', async () => {
          return request(app.getHttpServer())
            .post('/user/register')
            .send({
              email: mockEmail,
              password: '1234',
            })
            .expect(400);
        });
      });
      describe('Given valid request', () => {
        describe('Email does not exists', () => {
          it('should return 201 Created response', async () => {
            return request(app.getHttpServer())
              .post('/user/register')
              .send({
                email: mockEmail,
                password: SWAGGER_PASSWORD_EXAMPLE,
              })
              .expect(201);
          });
        });
        describe('Email already exists', () => {
          it('should return 400 Bad request response', async () => {
            await request(app.getHttpServer()).post('/user/register').send({
              email: mockEmail,
              password: SWAGGER_PASSWORD_EXAMPLE,
            });

            return request(app.getHttpServer())
              .post('/user/register')
              .send({
                email: mockEmail,
                password: SWAGGER_PASSWORD_EXAMPLE,
              })
              .expect(400);
          });
        });
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
