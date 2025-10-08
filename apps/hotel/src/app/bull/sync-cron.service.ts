import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SyncCronService {
  constructor(
    @InjectQueue('sync-country') private countryQueue: Queue,
    @InjectQueue('sync-city') private cityQueue: Queue,
    @InjectQueue('sync-hotel-codes') private hotelCodeQueue: Queue,
  ) {}

async scheduleSyncJobs() {
  console.log('🚀 Starting TBO sync job...');

  await this.countryQueue.add({}, { removeOnComplete: true });
  await this.cityQueue.add({}, { removeOnComplete: true });
  await this.hotelCodeQueue.add({}, { removeOnComplete: true });

  console.log('✅ All sync jobs enqueued manually.');
}


}
