import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';
import { LoginResponse } from './types/user-response.payload';
import { UserService } from '../user/user.service';
import { RegisterUserDTO } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  async validateUser(
    email: User['email'],
    userPassword: User['password'],
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcryptjs.compare(userPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const { password, ...result } = user;

    return result;
  }

  async login(email: User['email']): Promise<Omit<User, 'password' | 'id'> & LoginResponse> {
    const user = await this.usersService.findByEmail(email);

    return this.getLoginResponse(user);
  }

  async register(createUserDTO: RegisterUserDTO): Promise<LoginResponse> {
    const existingUser = await this.usersService.findByEmail(createUserDTO.email);

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const createdUser = await this.usersService.register({
      ...createUserDTO,
      password: await bcryptjs.hash(createUserDTO.password, 15),
    });

    const token = this.signToken({ email: createdUser.email, uuid: createdUser.uuid });

    return {
      access_token: token,
      ...createdUser,
    };
  }

  private getLoginResponse(user: User): Omit<User, 'password' | 'id'> & LoginResponse {
    const { password, id, ...rest } = user;
    return {
      access_token: this.signToken({ email: user.email, uuid: user.uuid }),
      ...rest,
    };
  }

  private signToken(payload: { email: User['email']; uuid: User['uuid'] }) {
    const secret = this.configService.getOrThrow('SECRET_KEY');
    const expiresIn = this.configService.getOrThrow('TOKEN_EXPIRATION_TIME');

    return this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });
  }
}
