import { Module } from '@nestjs/common';
import { CancellationController } from './cancellation.controller';
import { CancellationService } from './cancellation.service';
import { SearchFlightModule } from '../search-flight/search-flight.module';
import { GenerateTokenService } from '../search-flight/generateToken.service';

@Module({
  imports:[SearchFlightModule],
  controllers: [CancellationController],
  providers: [CancellationService,GenerateTokenService]
})
export class CancellationModule {}
