import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateShopDto } from './dto/create-shop.dto.js';
import { UpdateShopDto } from './dto/update-shop.dto.js';

@Injectable()
export class ShopsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createShopDto: CreateShopDto) {
    const marketplace = await this.prisma.marketplace.findUnique({
      where: { id: createShopDto.marketplaceId },
    });

    if (!marketplace) {
      throw new NotFoundException(
        `Marketplace #${createShopDto.marketplaceId} not found`,
      );
    }

    const existingShop = await this.prisma.shop.findUnique({
      where: {
        marketplaceId_marketplaceShopId: {
          marketplaceId: createShopDto.marketplaceId,
          marketplaceShopId: createShopDto.marketplaceShopId,
        },
      },
    });

    if (existingShop) {
      throw new ConflictException(
        'Shop already exists for this marketplace and marketplaceShopId',
      );
    }

    return this.prisma.shop.create({
      data: {
        marketplaceId: createShopDto.marketplaceId,
        marketplaceShopId: createShopDto.marketplaceShopId,
        name: createShopDto.name,
        region: createShopDto.region,
      },
      include: {
        marketplace: true,
        account: true,
      },
    });
  }

  async findAll() {
    return this.prisma.shop.findMany({
      orderBy: { id: 'asc' },
      include: {
        marketplace: true,
        account: true,
      },
    });
  }

  async findOne(id: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        marketplace: true,
        account: true,
      },
    });

    if (!shop) {
      throw new NotFoundException(`Shop #${id} not found`);
    }

    return shop;
  }

  async update(id: number, updateShopDto: UpdateShopDto) {
    const currentShop = await this.findOne(id);

    const marketplaceId =
      updateShopDto.marketplaceId ?? currentShop.marketplaceId;
    const marketplaceShopId =
      updateShopDto.marketplaceShopId ?? currentShop.marketplaceShopId;

    if (updateShopDto.marketplaceId !== undefined) {
      const marketplace = await this.prisma.marketplace.findUnique({
        where: { id: updateShopDto.marketplaceId },
      });

      if (!marketplace) {
        throw new NotFoundException(
          `Marketplace #${updateShopDto.marketplaceId} not found`,
        );
      }
    }

    const duplicate = await this.prisma.shop.findUnique({
      where: {
        marketplaceId_marketplaceShopId: {
          marketplaceId,
          marketplaceShopId,
        },
      },
    });

    if (duplicate && duplicate.id !== id) {
      throw new ConflictException(
        'Shop already exists for this marketplace and marketplaceShopId',
      );
    }

    return this.prisma.shop.update({
      where: { id },
      data: updateShopDto,
      include: {
        marketplace: true,
        account: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.shop.delete({
      where: { id },
      include: {
        marketplace: true,
        account: true,
      },
    });
  }
}
