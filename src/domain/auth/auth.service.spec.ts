import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { getJestMockFor } from '../../common/utils/get-mock.service';
import { SWAGGER_EMAIL_EXAMPLE } from '../auth/constants/swagger/email.example';
import { SWAGGER_PASSWORD_EXAMPLE } from '../auth/constants/swagger/password.example';
import { UserService } from '../user/user.service';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import * as bcryptjs from 'bcryptjs';
import { getUuid } from '../../common/utils/get-uuid';
import { USER_ALREADY_EXISTS_ERROR_MESSAGE } from '../user/constants/user-already-exists.error';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(UserService)
      .useValue(getJestMockFor(UserService))
      .overrideProvider(JwtService)
      .useValue(getJestMockFor(JwtService))
      .compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>;
    jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Given validateUser function', () => {
    describe('Given call with valid email', () => {
      describe('Given user does not exists', () => {
        it('should throw an unauthorized exception', async () => {
          jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(undefined);

          const email = SWAGGER_EMAIL_EXAMPLE;
          const password = SWAGGER_PASSWORD_EXAMPLE;

          await expect(service.validateUser(email, password)).rejects.toThrowError();

          expect(userService.findByEmail).toBeCalledWith(email);
        });
      });

      describe('Given user exists', () => {
        describe('Given password does not match', () => {
          it('should throw an unauthorized exception', async () => {
            const email = SWAGGER_EMAIL_EXAMPLE;
            const password = await bcryptjs.hash(SWAGGER_PASSWORD_EXAMPLE, 15);
            const mockUser = {
              password: await bcryptjs.hash(SWAGGER_PASSWORD_EXAMPLE + 'differenciator', 5), // Salt 5 for faster tests
            } as unknown as User;

            jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(mockUser);

            await expect(service.validateUser(email, password)).rejects.toThrowError();

            expect(userService.findByEmail).toBeCalledWith(email);
          });
        });

        describe('Given password matches', () => {
          it('should return user except password', async () => {
            const email = SWAGGER_EMAIL_EXAMPLE;
            const hashedPassword = await bcryptjs.hash(SWAGGER_PASSWORD_EXAMPLE, 5); // Salt 5 for faster tests
            const mockUser = {
              email,
              password: hashedPassword,
            } as unknown as User;

            jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(mockUser);

            const response = await service.validateUser(email, SWAGGER_PASSWORD_EXAMPLE);

            expect(response).toEqual({ email });
            expect(userService.findByEmail).toBeCalledWith(email);
          });
        });
      });
    });
  });

  describe('Given login function', () => {
    describe('Given call with valid email', () => {
      it('should return user except password', async () => {
        const email = SWAGGER_EMAIL_EXAMPLE;
        const spyOnGetLoginResponse = jest.spyOn(service as any, 'getLoginResponse');
        const spyOnSignToken = jest.spyOn(service as any, 'signToken');
        const mockUser = {
          email,
          uuid: getUuid(),
        } as unknown as User;
        const mockToken = 'token';

        jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(mockUser);
        jest.spyOn(jwtService, 'sign').mockReturnValueOnce(mockToken);

        const response = await service.login(email);

        expect(spyOnGetLoginResponse).toBeCalledWith(mockUser);
        expect(spyOnSignToken).toBeCalledWith(mockUser);
        expect(response).toEqual({ ...mockUser, access_token: mockToken });
        expect(userService.findByEmail).toBeCalledWith(email);
      });
    });
  });

  describe('Given getLoginResponse function', () => {
    it('should return user except password', () => {
      const email = SWAGGER_EMAIL_EXAMPLE;
      const mockUser = {
        email,
        uuid: getUuid(),
      } as unknown as User;

      const response = service['getLoginResponse'](mockUser);

      expect(response).toEqual({ ...mockUser });
    });
  });

  describe('Given signToken function', () => {
    it('should call jwtService.sign with user uuid', () => {
      const email = SWAGGER_EMAIL_EXAMPLE;
      const mockUser = {
        email,
        uuid: getUuid(),
      } as unknown as User;
      const mockToken = 'token';
      const spyOnConfigService = jest.spyOn(configService, 'get');
      const secret = configService.get('SECRET_KEY');
      const expiresIn = configService.get('TOKEN_EXPIRATION_TIME');

      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(mockToken);

      const response = service['signToken'](mockUser);

      expect(spyOnConfigService).toHaveBeenCalled();
      expect(jwtService.sign).toBeCalledWith(
        {
          uuid: mockUser.uuid,
          email,
        },
        {
          expiresIn,
          secret,
        },
      );
      expect(response).toEqual(mockToken);
    });
  });

  describe('Given register function', () => {
    describe('Given user already exists', () => {
      it('should throw an error', async () => {
        const email = SWAGGER_EMAIL_EXAMPLE;
        const password = SWAGGER_PASSWORD_EXAMPLE;
        const mockUser = {
          email,
        } as unknown as User;

        jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(mockUser);

        await expect(service.register({ email, password })).rejects.toThrowError(
          USER_ALREADY_EXISTS_ERROR_MESSAGE,
        );

        expect(userService.findByEmail).toBeCalledWith(email);
      });
    });

    describe('Given user does not exists', () => {
      it('should call the userService.register function, the signToken function and return user except password', async () => {
        const email = SWAGGER_EMAIL_EXAMPLE;
        const password = SWAGGER_PASSWORD_EXAMPLE;
        const mockUser = {
          email,
        } as unknown as User;
        const mockRegisterPayload = { email, password };
        const mockToken = 'token';

        jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(undefined);
        jest.spyOn(userService, 'register').mockResolvedValueOnce(mockUser);
        jest.spyOn(service as any, 'signToken').mockReturnValueOnce(mockToken);

        const spyOnSignToken = jest.spyOn(service as any, 'signToken');

        const response = await service.register(mockRegisterPayload);

        expect(userService.findByEmail).toBeCalledWith(email);
        expect(userService.register).toBeCalledWith({
          ...mockRegisterPayload,
          password: expect.any(String),
        });
        expect(spyOnSignToken).toHaveBeenLastCalledWith(mockUser);
        expect(response).toEqual({ ...mockUser, access_token: mockToken });
      });
    });
  });
});
