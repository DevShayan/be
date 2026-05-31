import { Module } from '@nestjs/common';
import { ErrorHandlerModule } from '../../core/infrastructure/error-handler/error-handler.module';
import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './application/profile.service';
import { IProfileRepository } from './domain/profile.repository.interface';
import { ProfileRepository } from './infrastructure/profile.repository';

@Module({
  imports: [ErrorHandlerModule],
  providers: [
    ProfileService,
    { provide: IProfileRepository, useClass: ProfileRepository },
  ],
  controllers: [ProfileController],
})
export class ProfileModule {}
