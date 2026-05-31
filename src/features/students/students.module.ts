import { Module } from '@nestjs/common';
import { ErrorHandlerModule } from '../../core/infrastructure/error-handler/error-handler.module';
import { StudentsController } from './controllers/students.controller';
import { StudentsService } from './application/students.service';
import { IStudentsRepository } from './domain/students.repository.interface';
import { StudentsRepository } from './infrastructure/students.repository';

@Module({
  imports: [ErrorHandlerModule],
  providers: [
    StudentsService,
    { provide: IStudentsRepository, useClass: StudentsRepository },
  ],
  controllers: [StudentsController],
})
export class StudentsModule {}
