import { Controller, Get, HttpCode } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor() {}

  @Public()
  @Get()
  @HttpCode(200)
  async helloWorld() {
    return '<h1>Hello Fudy!!!</h1>';
  }
}
