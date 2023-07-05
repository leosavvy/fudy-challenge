import { Logger, createParamDecorator } from '@nestjs/common';

export const UserDecorator = createParamDecorator((data: string, context) => {
  const request = context.switchToHttp().getRequest();

  if (!request.headers.authorization) {
    Logger.error('Missing Auth Token');
    return -1;
  }

  return request.user;
});
