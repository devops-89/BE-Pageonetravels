import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SyncCronService {
    constructor(
        @InjectQueue('sync-country') private countryQueue: Queue,
        @InjectQueue('sync-city') private cityQueue: Queue,
        @InjectQueue('sync-hotel-tbo-codes') private hotelTboCodeQueue: Queue,
        @InjectQueue('sync-hotel-code-table') private hotelCodeQueue: Queue,
        @InjectQueue('sync-hotel-details-table') private hotelDetailQueue: Queue
    ) {}

    async scheduleSyncJobs() {
        console.log(' Starting TBO sync job...');

        // await this.countryQueue.add({}, { removeOnComplete: true });
        // await this.cityQueue.add({}, { removeOnComplete: true });
        // await this.hotelTboCodeQueue.add({}, { removeOnComplete: true });
        await this.hotelCodeQueue.add({}, { removeOnComplete: true });
        await this.hotelDetailQueue.add({}, { removeOnComplete: true });

        console.log(' All sync jobs enqueued manually.');
    }
    /** ⏸️ Pause all queues */
    async pauseAll() {
        await this.countryQueue.pause();
        await this.cityQueue.pause();
        await this.hotelTboCodeQueue.pause();
        await this.hotelCodeQueue.pause();
        await this.hotelDetailQueue.pause();
        console.log('⏸️ All sync queues paused.');
    }

    /** ▶️ Resume all queues */
    async resumeAll() {
        await this.countryQueue.resume();
        await this.cityQueue.resume();
        await this.hotelTboCodeQueue.resume();
        await this.hotelCodeQueue.resume();
        await this.hotelDetailQueue.resume();
        console.log('▶️ All sync queues resumed.');
    }

    /** 🛑 Stop/terminate all jobs (clear queues) */
    async stopAll() {
        await this.countryQueue.empty();
        await this.cityQueue.empty();
        await this.hotelTboCodeQueue.empty();
        await this.hotelCodeQueue.empty();
        await this.hotelDetailQueue.empty();
        console.log('🛑 All sync queues cleared and terminated.');
    }

}
