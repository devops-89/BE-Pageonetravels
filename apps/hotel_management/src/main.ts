import {
  BadRequestException,
  Logger,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '../../../libs/config/config.service';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*',
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // ✅ Enables class-transformer decorators
      whitelist: true, // Optional: strips unknown properties
      forbidNonWhitelisted: false, // Optional: allows unknown props without throwing
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        let msg = '';
        for (const error of validationErrors) {
          msg += `Invalid ${error.property} - ${Object.values(error.constraints).join(', ')}, `;
        }
        return new BadRequestException(msg);
      },
    }),
  );

  const config = new ConfigService();
  config.loadFromEnv();
  const port = config.get().servicePorts.hotel_management || 3008;

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();