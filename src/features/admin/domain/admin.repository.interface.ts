import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class IAdminRepository {
  abstract createUser(data: { email: string; password: string; name: string; role: string; program?: string }): Promise<{ id: string }>;
  abstract updateUserRole(userId: string, role: string, coursePermissions: string[]): Promise<void>;
  abstract deactivateUser(userId: string): Promise<void>;
  abstract findUserById(userId: string): Promise<{ id: string; email: string; name: string; role: string } | null>;
  abstract findAllUsers(): Promise<{ id: string; email: string; name: string; role: string }[]>;
  abstract createCourse(data: { courseId: string; name: string; credits: number; teacherId?: string }): Promise<{ courseId: string }>;
  abstract deleteCourse(courseId: string): Promise<void>;
}
