import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class MarketplacesService {
  constructor(private readonly prisma: PrismaService) {}

  async initialize() {
    const shopee = await this.prisma.marketplace.upsert({
      where: {
        code: 'SHOPEE',
      },
      update: {
        name: 'Shopee',
      },
      create: {
        code: 'SHOPEE',
        name: 'Shopee',
      },
    });

    const tiktok = await this.prisma.marketplace.upsert({
      where: {
        code: 'TIKTOK',
      },
      update: {
        name: 'TikTok Shop',
      },
      create: {
        code: 'TIKTOK',
        name: 'TikTok Shop',
      },
    });

    return {
      message: 'Marketplaces initialized successfully',
      data: [shopee, tiktok],
    };
  }

  async findAll() {
    return this.prisma.marketplace.findMany({
      orderBy: {
        id: 'asc',
      },
      include: {
        shops: true,
      },
    });
  }

  async findOne(id: number) {
    const marketplace = await this.prisma.marketplace.findUnique({
      where: {
        id,
      },
      include: {
        shops: true,
      },
    });

    if (!marketplace) {
      throw new NotFoundException(`Marketplace #${id} not found`);
    }

    return marketplace;
  }
}
