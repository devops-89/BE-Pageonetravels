import { Module } from '@nestjs/common';
import { Commission } from '../../../../../libs/database/src/entities/commission.entity';
import { CommissionController } from './commission.controller';
import { CommissionService } from './commission.service';
import { TypeORMError } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../../../../../libs/config/config.module';
import { CommissionRepositoryService, DBModule } from 'libs/database/src';
import { ResponseHandlerModule } from '../../../../../libs/response-handler/response-handler.module';

@Module({
    imports: [
        DBModule.forRoot(),
        ConfigModule,
        TypeOrmModule.forFeature([CommissionRepositoryService, Commission]),
        ResponseHandlerModule
    ],
    controllers: [CommissionController],
    providers: [CommissionService],
})
export class CommissionModule {}
