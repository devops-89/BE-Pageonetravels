import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchFlightModule } from '../search-flight/search-flight.module';
// import { TBOConfigModule } from '../../../../libs/loadtbo-db-config/tbo-config.module';

@Module({
    imports: [
       SearchFlightModule
],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
