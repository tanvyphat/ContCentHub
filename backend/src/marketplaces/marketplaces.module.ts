import { Module } from '@nestjs/common';

import { MarketplacesController } from './marketplaces.controller.js';
import { MarketplacesService } from './marketplaces.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [MarketplacesController],
  providers: [MarketplacesService],
})
export class MarketplacesModule {}
