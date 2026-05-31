import { Module } from '@nestjs/common';
import { ErrorHandlerModule } from '../../core/infrastructure/error-handler/error-handler.module';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './application/admin.service';
import { IAdminRepository } from './domain/admin.repository.interface';
import { AdminRepository } from './infrastructure/admin.repository';

@Module({
  imports: [ErrorHandlerModule],
  providers: [
    AdminService,
    { provide: IAdminRepository, useClass: AdminRepository },
  ],
  controllers: [AdminController],
})
export class AdminModule {}
