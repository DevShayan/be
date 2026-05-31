import { Module } from '@nestjs/common';
import { HashingServiceModule } from './core/infrastructure/services/hashing-service.module';
import { AuthModule } from './features/auth/auth.module';
import { StudentsModule } from './features/students/students.module';
import { TeachersModule } from './features/teachers/teachers.module';
import { AdminModule } from './features/admin/admin.module';
import { ProfileModule } from './features/profile/profile.module';

@Module({
  imports: [
    HashingServiceModule,
    AuthModule,
    StudentsModule,
    TeachersModule,
    AdminModule,
    ProfileModule,
  ],
})
export class AppModule {}
