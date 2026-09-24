import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHello() {
    return {
      app: 'ContCentHub',
      status: 'OK',
    };
  }

  @Get('db-check')
  async dbCheck() {
    const marketplaceCount = await this.prisma.marketplace.count();

    return {
      database: 'connected',
      marketplaceCount,
    };
  }
}
