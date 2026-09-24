import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';

interface ReviewTokenPayload {
  sub: string;
  role: 'SHOPEE_REVIEWER';
  exp: number;
}

@Injectable()
export class ReviewAuthService {
  private get username() {
    return process.env.REVIEW_USERNAME ?? '';
  }

  private get password() {
    return process.env.REVIEW_PASSWORD ?? '';
  }

  private get secret() {
    return process.env.REVIEW_AUTH_SECRET ?? '';
  }

  login(username: string, password: string) {
    if (!this.username || !this.password || !this.secret) {
      throw new UnauthorizedException('Review account is not configured');
    }

    const validUser = this.safeEqual(username, this.username);
    const validPassword = this.safeEqual(password, this.password);

    if (!validUser || !validPassword) {
      throw new UnauthorizedException('Invalid review credentials');
    }

    const payload: ReviewTokenPayload = {
      sub: this.username,
      role: 'SHOPEE_REVIEWER',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    };

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.sign(encodedPayload);

    return {
      accessToken: `${encodedPayload}.${signature}`,
      expiresIn: 60 * 60 * 8,
      user: {
        username: payload.sub,
        role: payload.role,
      },
    };
  }

  verifyAuthorizationHeader(authorization?: string) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authorization.slice('Bearer '.length);
    const [encodedPayload, signature] = token.split('.');

    if (!encodedPayload || !signature || !this.secret) {
      throw new UnauthorizedException('Invalid token');
    }

    const expectedSignature = this.sign(encodedPayload);
    if (!this.safeEqual(signature, expectedSignature)) {
      throw new UnauthorizedException('Invalid token signature');
    }

    let payload: ReviewTokenPayload;
    try {
      payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as ReviewTokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid token payload');
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token expired');
    }

    return payload;
  }

  private sign(value: string) {
    return createHmac('sha256', this.secret).update(value).digest('base64url');
  }

  private safeEqual(left: string, right: string) {
    const a = Buffer.from(left);
    const b = Buffer.from(right);
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
