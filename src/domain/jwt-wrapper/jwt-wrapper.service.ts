import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class JwtWrapperService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  signToken(payload: { email: User['email']; uuid: User['uuid'] }) {
    const secret = this.configService.getOrThrow('SECRET_KEY');
    const expiresIn = this.configService.getOrThrow('TOKEN_EXPIRATION_TIME');

    return this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });
  }
}
