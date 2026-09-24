import { Module } from '@nestjs/common';
import { ShopeeController } from './shopee.controller.js';
import { ShopeeService } from './shopee.service.js';

@Module({
  controllers: [ShopeeController],
  providers: [ShopeeService],
})
export class ShopeeModule {}
