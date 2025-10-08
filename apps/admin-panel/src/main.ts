import { BadRequestException, Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '../../../libs/config/config.service';
import { AppModule } from './app/app.module';

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
            whitelist: true,
            transform: true,
            exceptionFactory: (validationErrors: ValidationError[] = []) => {
                if (!validationErrors || validationErrors.length === 0) {
                    // No validation errors -> do not throw
                    return undefined;
                }

                let msg = '';
                for (const error of validationErrors) {
                    if (error.constraints) {
                        msg += `Invalid ${error.property} - ${Object.values(error.constraints).join(', ')}, `;
                    }
                }

                // Trim trailing comma and space
                msg = msg.replace(/, $/, '');

                return new BadRequestException(msg || 'Validation failed');
            },
        }),
    );

    const config = new ConfigService();
    config.loadFromEnv();
    const port = config.get().servicePorts.adminpanel || 3005;
    await app.listen(port);
    Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
