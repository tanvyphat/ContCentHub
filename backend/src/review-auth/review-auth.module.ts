import { Module } from '@nestjs/common';
import { ReviewAuthController } from './review-auth.controller.js';
import { ReviewAuthService } from './review-auth.service.js';

@Module({
  controllers: [ReviewAuthController],
  providers: [ReviewAuthService],
})
export class ReviewAuthModule {}
