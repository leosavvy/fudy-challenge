import { Test, TestingModule } from '@nestjs/testing';
import { getJestMockFor } from '../../common/utils/get-mock.service';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { SWAGGER_EMAIL_EXAMPLE } from '../../common/swagger/constants/email.example';
import { SWAGGER_PASSWORD_EXAMPLE } from '../../common/swagger/constants/password.example';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { LoginResponse } from '../../common/types/login-response.payload';

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
});
