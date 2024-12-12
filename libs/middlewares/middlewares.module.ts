import { Module } from '@nestjs/common';
import { TokenValidationMiddleware, KeyValidationMiddleware } from './authMiddleware';

@Module({
  providers: [
    TokenValidationMiddleware,
    KeyValidationMiddleware,
  ],
})
export class MiddlewaresModule {}