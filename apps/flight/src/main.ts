/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { BadRequestException, Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {ConfigService } from '../../../libs/config/config.service';
import { AppModule } from './app/app.module';
// import { TBO_CredentialsService } from '../../../libs/loadtbo-db-config/tbo-config.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        allowedHeaders: "*",
      });

    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);

    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: (validationErrors: ValidationError[] = []) => {
          let msg = '';
          for (const error of validationErrors) {
              msg += `Invalid ${error.property} - ${Object.values(error.constraints).join(', ')}, `;
          }
          return new BadRequestException(msg);
        },
      }),
    );
    
    const config = new ConfigService()
    // const config_service = new TBO_CredentialsService(a,b)
    // await TBO_CredentialsService.getSettingValues();
    config.loadFromEnv()
    const port = config.get().servicePorts.flight || 3002;
    await app.listen(port);
    Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
