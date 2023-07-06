import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { SWAGGER_EMAIL_EXAMPLE } from '../../common/swagger/constants/email.example';
import { getJestMockFor } from '../../common/utils/get-mock.service';
import { getUuid } from '../../common/utils/get-uuid';
import { JwtWrapperModule } from './jwt-wrapper.module';
import { JwtWrapperService } from './jwt-wrapper.service';

describe('UserService', () => {
  let service: JwtWrapperService;
  let configService: jest.Mocked<ConfigService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtWrapperModule],
    })
      .overrideProvider(ConfigService)
      .useValue(getJestMockFor(ConfigService))
      .overrideProvider(JwtService)
      .useValue(getJestMockFor(JwtService))
      .compile();

    service = module.get<JwtWrapperService>(JwtWrapperService);
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
    jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Given signToken function', () => {
    it('should call configService.getOrThrow and jwtService.sign functions and config service should not throw', () => {
      const email = SWAGGER_EMAIL_EXAMPLE;
      const mockUser = {
        email,
        uuid: getUuid(),
      } as unknown as User;
      const mockToken = 'token';
      const spyOnConfigServiceGetOrThrow = jest.spyOn(configService, 'getOrThrow');

      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(mockToken);
      jest.spyOn(configService, 'getOrThrow').mockReturnValue('');

      const response = service.signToken(mockUser);

      expect(spyOnConfigServiceGetOrThrow).toHaveBeenCalled();
      expect(jwtService.sign).toBeCalledWith(
        {
          uuid: mockUser.uuid,
          email,
        },
        {
          expiresIn: expect.any(String),
          secret: expect.any(String),
        },
      );
      expect(response).toEqual(mockToken);
    });
  });
});
