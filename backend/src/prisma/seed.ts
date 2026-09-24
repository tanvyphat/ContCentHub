import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, MarketplaceCode } from '../generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.marketplace.upsert({
    where: {
      code: MarketplaceCode.SHOPEE,
    },
    update: {
      name: 'Shopee',
    },
    create: {
      code: MarketplaceCode.SHOPEE,
      name: 'Shopee',
    },
  });

  await prisma.marketplace.upsert({
    where: {
      code: MarketplaceCode.TIKTOK,
    },
    update: {
      name: 'TikTok Shop',
    },
    create: {
      code: MarketplaceCode.TIKTOK,
      name: 'TikTok Shop',
    },
  });

  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
