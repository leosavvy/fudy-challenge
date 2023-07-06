import { Test, TestingModule } from '@nestjs/testing';
import { getJestMockFor } from '../../common/utils/get-mock.service';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { SWAGGER_EMAIL_EXAMPLE } from './constants/swagger/email.example';
import { SWAGGER_PASSWORD_EXAMPLE } from './constants/swagger/password.example';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { LoginResponse } from './types/user-response.payload';
import { getUuid } from '../../common/utils/get-uuid';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(AuthService)
      .useValue(getJestMockFor(AuthService))
      .overrideProvider(Logger)
      .useValue(getJestMockFor(Logger))
      .compile();

    controller = module.get<AuthController>(AuthController);
    logger = module.get<Logger>(Logger) as jest.Mocked<Logger>;
    authService = module.get<AuthService>(AuthService) as jest.Mocked<AuthService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Given login function', () => {
    describe('Given call with valid email and password', () => {
      describe('Given error when loging in', () => {
        describe('Given http exception', () => {
          it('should throw the exception', async () => {
            jest.spyOn(authService, 'login').mockRejectedValueOnce(new UnauthorizedException());

            const email = SWAGGER_EMAIL_EXAMPLE;
            const password = SWAGGER_PASSWORD_EXAMPLE;

            await expect(controller.login({ email, password })).rejects.toThrowError();

            expect(authService.login).toBeCalledWith(email);
          });
        });

        describe('Given unknown error', () => {
          it('should log the error', async () => {
            jest.spyOn(authService, 'login').mockRejectedValueOnce(new Error('test'));

            const email = SWAGGER_EMAIL_EXAMPLE;
            const password = SWAGGER_PASSWORD_EXAMPLE;

            await controller.login({ email, password });

            expect(authService.login).toBeCalledWith(email);
            expect(logger.error).toBeCalled();
          });
        });
      });

      describe('Given success when loging in', () => {
        it('should return the token', async () => {
          const mockToken = 'test';
          jest
            .spyOn(authService, 'login')
            .mockResolvedValueOnce({ access_token: mockToken } as unknown as Omit<
              User,
              'password' | 'id'
            > &
              LoginResponse);

          const email = SWAGGER_EMAIL_EXAMPLE;
          const password = SWAGGER_PASSWORD_EXAMPLE;

          const response = await controller.login({ email, password });

          expect(authService.login).toBeCalledWith(email);
          expect(response).toEqual(mockToken);
        });
      });
    });
  });

  describe('Given register function', () => {
    describe('Given call with valid email and password', () => {
      describe('Given error when registering', () => {
        describe('Given http exception', () => {
          it('should throw the exception', async () => {
            jest.spyOn(authService, 'register').mockRejectedValueOnce(new UnauthorizedException());
            const mockPayload = {
              email: SWAGGER_EMAIL_EXAMPLE,
              password: SWAGGER_PASSWORD_EXAMPLE,
            };

            await expect(controller.register(mockPayload)).rejects.toThrowError();

            expect(authService.register).toBeCalledWith(mockPayload);
          });
        });

        describe('Given unknown error', () => {
          it('should log the error', async () => {
            jest.spyOn(authService, 'register').mockRejectedValueOnce(new Error('test'));
            const mockPayload = {
              email: SWAGGER_EMAIL_EXAMPLE,
              password: SWAGGER_PASSWORD_EXAMPLE,
            };

            await controller.register(mockPayload);

            expect(authService.register).toBeCalledWith(mockPayload);
            expect(logger.error).toBeCalled();
          });
        });
      });

      describe('Given success when registering', () => {
        it('should return a login response', async () => {
          const expectedPayload = {
            access_token: 'test',
            uuid: getUuid(),
            email: SWAGGER_EMAIL_EXAMPLE,
            createdAt: new Date(),
            updatedAt: null,
          };

          jest.spyOn(authService, 'register').mockResolvedValueOnce(expectedPayload);
          const mockPayload = {
            email: SWAGGER_EMAIL_EXAMPLE,
            password: SWAGGER_PASSWORD_EXAMPLE,
          };

          const response = await controller.register(mockPayload);

          expect(authService.register).toBeCalledWith(mockPayload);
          expect(response).toEqual(expectedPayload);
        });
      });
    });
  });
});
