import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from '../application/profile.service';
import { ErrorHandlerService } from '../../../core/infrastructure/error-handler/error-handler.service';
import type { Request } from 'express';

@Controller('profile')
@UseGuards(AuthGuard('access'))
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  @Get()
  async getProfile(@Req() req: Request) {
    try {
      const data = await this.profileService.getProfile(req.user!.id);
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }
}
