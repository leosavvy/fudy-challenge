import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { UserPersistence } from '../../persistence/user/user.persistence';
import { getJestMockFor } from '../../common/utils/get-mock.service';
import { SWAGGER_EMAIL_EXAMPLE } from '../auth/constants/swagger/email.example';
import { User } from '@prisma/client';
import { SWAGGER_PASSWORD_EXAMPLE } from '../auth/constants/swagger/password.example';
import { getUuid } from '../../common/utils/get-uuid';

describe('UserService', () => {
  let service: UserService;
  let userPersistence: jest.Mocked<UserPersistence>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    })
      .overrideProvider(UserPersistence)
      .useValue(getJestMockFor(UserPersistence))
      .compile();

    service = module.get<UserService>(UserService);
    userPersistence = module.get<UserPersistence>(UserPersistence) as jest.Mocked<UserPersistence>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Given findByEmail function', () => {
    describe('Given call with valid email', () => {
      it('should be called with email', async () => {
        jest.spyOn(userPersistence, 'findUserByEmail').mockResolvedValueOnce(undefined);

        const email = SWAGGER_EMAIL_EXAMPLE;

        await service.findByEmail(email);

        expect(userPersistence.findUserByEmail).toBeCalledWith(email);
      });
    });
  });

  describe('Given register function', () => {
    describe('Given user already exists user', () => {
      it('should throw a bad request exception', async () => {
        jest.spyOn(userPersistence, 'findUserByEmail').mockResolvedValueOnce({} as unknown as User);

        const email = SWAGGER_EMAIL_EXAMPLE;

        await expect(service.register({ email, password: '12345678' })).rejects.toThrowError();

        expect(userPersistence.findUserByEmail).toBeCalledWith(email);
        expect(userPersistence.createUser).not.toBeCalled();
      });
    });

    describe('Given non-existent user', () => {
      it('should throw a bad request exception', async () => {
        const email = SWAGGER_EMAIL_EXAMPLE;
        const password = SWAGGER_PASSWORD_EXAMPLE;
        jest.spyOn(userPersistence, 'findUserByEmail').mockResolvedValueOnce(undefined);
        jest.spyOn(userPersistence, 'createUser').mockResolvedValueOnce({
          password: 'example',
          email,
          id: 1,
          createdAt: new Date(),
          updatedAt: null,
          uuid: getUuid(),
        } as User);

        await service.register({ email, password });

        expect(userPersistence.findUserByEmail).toBeCalledWith(email);
        expect(userPersistence.createUser).toBeCalledWith({
          createdAt: expect.any(Date),
          email,
          password,
          uuid: expect.any(String),
        });
      });
    });
  });
});
