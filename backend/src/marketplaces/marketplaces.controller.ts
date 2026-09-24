import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';

import { MarketplacesService } from './marketplaces.service.js';

@Controller('marketplaces')
export class MarketplacesController {
  constructor(private readonly marketplacesService: MarketplacesService) {}

  @Post('initialize')
  initialize() {
    return this.marketplacesService.initialize();
  }

  @Get()
  findAll() {
    return this.marketplacesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.marketplacesService.findOne(id);
  }
}
