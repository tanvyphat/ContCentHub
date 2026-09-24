import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ReviewAuthService } from './review-auth.service.js';

@Controller('review-auth')
export class ReviewAuthController {
  constructor(private readonly reviewAuthService: ReviewAuthService) {}

  @Post('login')
  login(@Body() body: { username?: string; password?: string }) {
    return this.reviewAuthService.login(body.username ?? '', body.password ?? '');
  }

  @Get('me')
  me(@Headers('authorization') authorization?: string) {
    const payload = this.reviewAuthService.verifyAuthorizationHeader(authorization);

    return {
      username: payload.sub,
      role: payload.role,
    };
  }
}
