import { Test, TestingModule } from '@nestjs/testing';
import { FlightPaymentController } from './flight-payment.controller';

describe('FlightPaymentController', () => {
    let controller: FlightPaymentController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FlightPaymentController],
        }).compile();

        controller = module.get<FlightPaymentController>(FlightPaymentController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
