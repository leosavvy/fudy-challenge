import { ConsoleLogger, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SWAGGER_EMAIL_EXAMPLE } from '../../common/swagger/constants/email.example';
import { SWAGGER_PASSWORD_EXAMPLE } from '../../common/swagger/constants/password.example';
import { getJestMockFor } from '../../common/utils/get-mock.service';
import { getUuid } from '../../common/utils/get-uuid';
import { UserController } from './user.controller';
import { UserModule } from './user.module';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;
  let logger: jest.Mocked<ConsoleLogger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    })
      .overrideProvider(UserService)
      .useValue(getJestMockFor(UserService))
      .overrideProvider(ConsoleLogger)
      .useValue(getJestMockFor(ConsoleLogger))
      .compile();

    controller = module.get<UserController>(UserController);
    logger = module.get<ConsoleLogger>(ConsoleLogger) as jest.Mocked<ConsoleLogger>;
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Given register function', () => {
    describe('Given call with valid email and password', () => {
      describe('Given error when registering', () => {
        describe('Given http exception', () => {
          it('should throw the exception', async () => {
            jest.spyOn(userService, 'register').mockRejectedValueOnce(new UnauthorizedException());
            const mockPayload = {
              email: SWAGGER_EMAIL_EXAMPLE,
              password: SWAGGER_PASSWORD_EXAMPLE,
            };

            await expect(controller.register(mockPayload)).rejects.toThrowError();

            expect(userService.register).toBeCalledWith(mockPayload);
          });
        });

        describe('Given unknown error', () => {
          it('should log the error', async () => {
            jest.spyOn(userService, 'register').mockRejectedValueOnce(new Error('test'));
            const mockPayload = {
              email: SWAGGER_EMAIL_EXAMPLE,
              password: SWAGGER_PASSWORD_EXAMPLE,
            };

            await controller.register(mockPayload);

            expect(userService.register).toBeCalledWith(mockPayload);
            expect(logger.error).toBeCalled();
          });
        });
      });

      describe('Given success when registering', () => {
        it('should return the created user uuid', async () => {
          const uuid = getUuid();

          jest.spyOn(userService, 'register').mockResolvedValueOnce(uuid);
          const mockPayload = {
            email: SWAGGER_EMAIL_EXAMPLE,
            password: SWAGGER_PASSWORD_EXAMPLE,
          };

          const response = await controller.register(mockPayload);

          expect(userService.register).toBeCalledWith(mockPayload);
          expect(response).toEqual(uuid);
        });
      });
    });
  });
});
