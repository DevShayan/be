import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { LoginRequestDto } from '../application/dtos/login-request.dto';
import { ErrorHandlerService } from '../../../core/infrastructure/error-handler/error-handler.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginRequestDto) {
    console.log("OK");
    try {
      const result = await this.authService.login(dto);
      return { status: 'success', data: result };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }
}
