
import { BadRequestException, Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { ConfigService } from '../../../libs/config/config.service';

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
  config.loadFromEnv()
  const port = config.get().servicePorts.authentication || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on:->> http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
