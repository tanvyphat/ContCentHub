import { Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ShopeeService } from './shopee.service.js';

@Controller('shopee')
export class ShopeeController {
  constructor(private readonly shopeeService: ShopeeService) {}

  @Get('auth-url')
  getAuthUrl() {
    return this.shopeeService.getAuthorizationUrl();
  }

  @Get('callback')
  handleCallback(
    @Query('code') code: string,
    @Query('shop_id') shopId: string,
  ) {
    return this.shopeeService.handleCallback(code, shopId);
  }

  @Post('shops/:id/refresh-token')
  refreshToken(@Param('id', ParseIntPipe) id: number) {
    return this.shopeeService.refreshShopToken(id);
  }
}
