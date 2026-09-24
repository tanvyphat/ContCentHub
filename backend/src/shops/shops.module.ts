import { Module } from '@nestjs/common';
import { ShopsService } from './shops.service.js';
import { ShopsController } from './shops.controller.js';

@Module({
  providers: [ShopsService],
  controllers: [ShopsController]
})
export class ShopsModule {}
