import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import {ResponseHandlerModule} from '../../../../libs/response-handler/response-handler.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from '../../../../libs/database/src/entities/user.entity';
import {UserRepositoryService} from "../../../../libs/database/src/repositories/user.repository";


@Module({
    imports:[
        TypeOrmModule.forFeature([User]),
        ResponseHandlerModule,

    ],
  controllers: [ProfileController],
  providers: [ProfileService, UserRepositoryService]
})
export class ProfileModule {}
