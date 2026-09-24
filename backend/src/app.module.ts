import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { MarketplacesModule } from './marketplaces/marketplaces.module.js';
import { ShopsModule } from './shops/shops.module.js';
import { ShopeeModule } from './shopee/shopee.module.js';
import { ReviewAuthModule } from './review-auth/review-auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    MarketplacesModule,
    ShopsModule,
    ShopeeModule,
    ReviewAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
