import { Module } from '@nestjs/common';
import { ErrorHandlerModule } from '../../core/infrastructure/error-handler/error-handler.module';
import { JwtStrategiesModule } from '../../core/infrastructure/jwt-strategies/jwt-strategies.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './application/auth.service';
import { IAuthRepository } from './domain/auth.repository.interface';
import { AuthRepository } from './infrastructure/auth.repository';

@Module({
  imports: [ErrorHandlerModule, JwtStrategiesModule],
  providers: [
    AuthService,
    { provide: IAuthRepository, useClass: AuthRepository },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
