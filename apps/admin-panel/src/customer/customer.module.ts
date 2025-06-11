import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { User } from '../../../../libs/database/src/entities/user.entity';
import { UserRepositoryService } from 'libs/database/src';
import { ResponseHandlerModule } from 'libs/response-handler/response-handler.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ResponseHandlerModule
  ],
  controllers: [CustomerController],
  providers: [CustomerService, UserRepositoryService],
})
export class CustomerModule {}
