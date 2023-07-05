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

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(UserService)
      .useValue(getJestMockFor(UserService))
      .overrideProvider(JwtService)
      .useValue(getJestMockFor(JwtService))
      .overrideProvider(ConfigService)
      .useValue(getJestMockFor(ConfigService))
      .compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>;
    jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
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

            jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce({
              password: await bcryptjs.hash(SWAGGER_PASSWORD_EXAMPLE + 'differenciator', 5), // Salt 5 for faster tests
            } as unknown as User);

            await expect(service.validateUser(email, password)).rejects.toThrowError();

            expect(userService.findByEmail).toBeCalledWith(email);
          });
        });

        describe('Given password matches', () => {
          it('should return user except password', async () => {
            const email = SWAGGER_EMAIL_EXAMPLE;
            const hashedPassword = await bcryptjs.hash(SWAGGER_PASSWORD_EXAMPLE, 5); // Salt 5 for faster tests

            jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce({
              email,
              password: hashedPassword,
            } as unknown as User);

            const response = await service.validateUser(email, SWAGGER_PASSWORD_EXAMPLE);

            expect(response).toEqual({ email });
            expect(userService.findByEmail).toBeCalledWith(email);
          });
        });
      });
    });
  });
});
