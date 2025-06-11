import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm'; // Make sure this is imported
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { UserStatsModule } from './user-stats/user-stats.module';


@Module({
    imports: [UserModule,UserStatsModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}

