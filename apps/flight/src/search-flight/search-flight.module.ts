import { Module } from '@nestjs/common';
import { SearchFlightController } from './search-flight.controller';
import { SearchFlightService } from './search-flight.service';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';

@Module({
    imports:[ResponseHandlerModule
    ],
    controllers: [SearchFlightController],
    providers: [SearchFlightService],
})
export class SearchFlightModule {}
