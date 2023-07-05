import { LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AuthModule } from './domain/auth/auth.module';

async function bootstrap() {
  const host = process.env.HOST ?? '127.0.0.1';
  const port = +(process.env.PORT ?? 8002);

  let loggerConfig: LogLevel[] = ['log', 'verbose', 'warn', 'error'];
  if (process.env.VERBOSE_DEBUGGING === 'true') {
    loggerConfig = ['log', 'debug', 'verbose', 'warn', 'error'];
  }

  const app = await NestFactory.create(AppModule, {
    logger: loggerConfig,
    forceCloseConnections: true,
  });
  app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ValidationPipe());
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('Team Tailor Challenge - API')
    .setDescription('The Team Tailor Challenge API documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    include: [AuthModule],
  });
  SwaggerModule.setup('docs', app, document);

  await app.listen(port, host);
}
bootstrap();
