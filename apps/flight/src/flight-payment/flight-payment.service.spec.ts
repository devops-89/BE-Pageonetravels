import { Test, TestingModule } from '@nestjs/testing';
import { FlightPaymentService } from './flight-payment.service';

describe('FlightPaymentService', () => {
  let service: FlightPaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlightPaymentService],
    }).compile();

    service = module.get<FlightPaymentService>(FlightPaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
