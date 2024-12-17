import { Module } from '@nestjs/common';
import { Commission } from '../../../../libs/database/src/entities/commission.entity';
import { CommissionController } from './commission.controller';
import { CommissionService } from './commission.service';
import { TypeORMError } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports : [TypeOrmModule.forFeature([Commission])],
    controllers: [CommissionController],
    providers: [CommissionService],
})
export class CommissionModule {}
