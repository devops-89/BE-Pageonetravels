import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Headers } from '../entities/headers.entity';

@Injectable()
export class CommissionRepositoryService {
  constructor(
        @InjectRepository(Headers)
        private readonly headerRepository: Repository<Headers>,
  ) { }

  

}