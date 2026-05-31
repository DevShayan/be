import { Module } from '@nestjs/common';
import { ErrorHandlerModule } from '../../core/infrastructure/error-handler/error-handler.module';
import { TeachersController } from './controllers/teachers.controller';
import { TeachersService } from './application/teachers.service';
import { ITeachersRepository } from './domain/teachers.repository.interface';
import { TeachersRepository } from './infrastructure/teachers.repository';

@Module({
  imports: [ErrorHandlerModule],
  providers: [
    TeachersService,
    { provide: ITeachersRepository, useClass: TeachersRepository },
  ],
  controllers: [TeachersController],
})
export class TeachersModule {}
