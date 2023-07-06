import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';
import { LoginResponse } from '../../common/types/login-response.payload';
import { JwtWrapperService } from '../jwt-wrapper/jwt-wrapper.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtWrapperService: JwtWrapperService,
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

  private getLoginResponse(user: User): Omit<User, 'password' | 'id'> & LoginResponse {
    const { password, id, ...rest } = user;
    return {
      access_token: this.jwtWrapperService.signToken({ email: user.email, uuid: user.uuid }),
      ...rest,
    };
  }
}
