import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';

type ShopeeTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expire_in?: number;
  error?: string;
  message?: string;
  request_id?: string;
  shop_id?: number;
};

@Injectable()
export class ShopeeService {
  private readonly authPath = '/api/v2/shop/auth_partner';
  private readonly tokenPath = '/api/v2/auth/token/get';
  private readonly refreshPath = '/api/v2/auth/access_token/get';

  constructor(private readonly prisma: PrismaService) {}

  private get partnerId() {
    const value = Number(process.env.SHOPEE_PARTNER_ID);

    if (!Number.isInteger(value) || value <= 0) {
      throw new InternalServerErrorException(
        'SHOPEE_PARTNER_ID is missing or invalid',
      );
    }

    return value;
  }

  private get partnerKey() {
    const value = process.env.SHOPEE_PARTNER_KEY;

    if (!value) {
      throw new InternalServerErrorException(
        'SHOPEE_PARTNER_KEY is not defined',
      );
    }

    return value;
  }

  private get baseUrl() {
    return (
      process.env.SHOPEE_BASE_URL ?? 'https://partner.shopeemobile.com'
    ).replace(/\/$/, '');
  }

  private get redirectUrl() {
    const value = process.env.SHOPEE_REDIRECT_URL;

    if (!value) {
      throw new InternalServerErrorException(
        'SHOPEE_REDIRECT_URL is not defined',
      );
    }

    return value;
  }

  private timestamp() {
    return Math.floor(Date.now() / 1000);
  }

  private signPublic(path: string, timestamp: number) {
    const baseString = `${this.partnerId}${path}${timestamp}`;

    return createHmac('sha256', this.partnerKey)
      .update(baseString)
      .digest('hex');
  }

  private buildPublicUrl(path: string, timestamp: number) {
    const params = new URLSearchParams({
      partner_id: String(this.partnerId),
      timestamp: String(timestamp),
      sign: this.signPublic(path, timestamp),
    });

    return `${this.baseUrl}${path}?${params.toString()}`;
  }

  getAuthorizationUrl() {
    const timestamp = this.timestamp();
    const params = new URLSearchParams({
      partner_id: String(this.partnerId),
      redirect: this.redirectUrl,
      timestamp: String(timestamp),
      sign: this.signPublic(this.authPath, timestamp),
    });

    return {
      authorizationUrl: `${this.baseUrl}${this.authPath}?${params.toString()}`,
      expiresInSeconds: 300,
    };
  }

  async handleCallback(code?: string, shopIdRaw?: string) {
    if (!code) {
      throw new BadRequestException('Missing Shopee authorization code');
    }

    const shopId = Number(shopIdRaw);

    if (!Number.isInteger(shopId) || shopId <= 0) {
      throw new BadRequestException('Invalid or missing Shopee shop_id');
    }

    const token = await this.exchangeCodeForToken(code, shopId);

    if (!token.access_token || !token.refresh_token) {
      throw new BadGatewayException({
        message: 'Shopee did not return access_token/refresh_token',
        error: token.error,
        shopeeMessage: token.message,
        requestId: token.request_id,
      });
    }

    const marketplace = await this.prisma.marketplace.findUnique({
      where: { code: 'SHOPEE' },
    });

    if (!marketplace) {
      throw new NotFoundException(
        'SHOPEE marketplace is not initialized. Call POST /api/marketplaces/initialize first.',
      );
    }

    const expiresAt = new Date(
      Date.now() + Math.max(token.expire_in ?? 0, 0) * 1000,
    );

    const shop = await this.prisma.shop.upsert({
      where: {
        marketplaceId_marketplaceShopId: {
          marketplaceId: marketplace.id,
          marketplaceShopId: String(shopId),
        },
      },
      update: {
        status: 'CONNECTED',
      },
      create: {
        marketplaceId: marketplace.id,
        marketplaceShopId: String(shopId),
        name: `Shopee Shop ${shopId}`,
        status: 'CONNECTED',
      },
    });

    await this.prisma.marketplaceAccount.upsert({
      where: { shopId: shop.id },
      update: {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        tokenExpiresAt: expiresAt,
        status: 'CONNECTED',
      },
      create: {
        shopId: shop.id,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        tokenExpiresAt: expiresAt,
        status: 'CONNECTED',
      },
    });

    return {
      message: 'Shopee shop connected successfully',
      shop: {
        id: shop.id,
        marketplaceShopId: shop.marketplaceShopId,
        name: shop.name,
        status: 'CONNECTED',
        tokenExpiresAt: expiresAt,
      },
    };
  }

  async refreshShopToken(shopId: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        marketplace: true,
        account: true,
      },
    });

    if (!shop) {
      throw new NotFoundException(`Shop #${shopId} not found`);
    }

    if (shop.marketplace.code !== 'SHOPEE') {
      throw new BadRequestException(`Shop #${shopId} is not a Shopee shop`);
    }

    if (!shop.account?.refreshToken) {
      throw new BadRequestException(
        `Shop #${shopId} does not have a Shopee refresh token`,
      );
    }

    const marketplaceShopId = Number(shop.marketplaceShopId);

    if (!Number.isInteger(marketplaceShopId) || marketplaceShopId <= 0) {
      throw new BadRequestException(
        `Shop #${shopId} has an invalid Shopee marketplaceShopId`,
      );
    }

    const token = await this.requestToken(this.refreshPath, {
      partner_id: this.partnerId,
      refresh_token: shop.account.refreshToken,
      shop_id: marketplaceShopId,
    });

    if (!token.access_token || !token.refresh_token) {
      await this.prisma.marketplaceAccount.update({
        where: { shopId },
        data: { status: 'ERROR' },
      });

      throw new BadGatewayException({
        message: 'Shopee token refresh failed',
        error: token.error,
        shopeeMessage: token.message,
        requestId: token.request_id,
      });
    }

    const expiresAt = new Date(
      Date.now() + Math.max(token.expire_in ?? 0, 0) * 1000,
    );

    await this.prisma.$transaction([
      this.prisma.marketplaceAccount.update({
        where: { shopId },
        data: {
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
          tokenExpiresAt: expiresAt,
          status: 'CONNECTED',
        },
      }),
      this.prisma.shop.update({
        where: { id: shopId },
        data: { status: 'CONNECTED' },
      }),
    ]);

    return {
      message: 'Shopee access token refreshed successfully',
      shopId,
      tokenExpiresAt: expiresAt,
    };
  }

  private exchangeCodeForToken(code: string, shopId: number) {
    return this.requestToken(this.tokenPath, {
      code,
      partner_id: this.partnerId,
      shop_id: shopId,
    });
  }

  private async requestToken(
    path: string,
    body: Record<string, string | number>,
  ): Promise<ShopeeTokenResponse> {
    const timestamp = this.timestamp();
    const url = this.buildPublicUrl(path, timestamp);

    let response: Response;

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw new BadGatewayException(
        `Unable to reach Shopee Open Platform: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }

    let payload: ShopeeTokenResponse;

    try {
      payload = (await response.json()) as ShopeeTokenResponse;
    } catch {
      throw new BadGatewayException(
        `Shopee returned an invalid response (HTTP ${response.status})`,
      );
    }

    if (!response.ok) {
      throw new BadGatewayException({
        message: `Shopee request failed with HTTP ${response.status}`,
        error: payload.error,
        shopeeMessage: payload.message,
        requestId: payload.request_id,
      });
    }

    return payload;
  }
}
