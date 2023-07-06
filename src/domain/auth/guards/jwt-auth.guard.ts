import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { LoginResponse } from '../../../common/types/login-response.payload';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (token) {
      const user = await this.getUser(token);
      request.user = user;

      return !!user;
    }

    throw new UnauthorizedException();
  }

  async getUser(token: string) {
    let decodedToken: LoginResponse;

    try {
      decodedToken = this.jwtService.verify(token, {
        secret: this.configService.get('SECRET_KEY'),
      });

      const user = await this.userService.findByEmail(decodedToken.email);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (decodedToken.uuid !== user.uuid) {
        throw new UnauthorizedException('Invalid token');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException(
        `There was an error when validating the provided token: ${error.message}`,
      );
    }
  }
}
