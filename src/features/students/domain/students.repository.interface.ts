import { Injectable } from '@nestjs/common';
import { DashboardEntity } from './entities/dashboard.entity';

@Injectable()
export abstract class IStudentsRepository {
  abstract getDashboard(userId: string): Promise<DashboardEntity>;
  abstract findEnrolledCourseIds(userId: string): Promise<string[]>;
  abstract isEnrolled(userId: string, courseId: string): Promise<boolean>;
  abstract checkPrerequisites(courseId: string): Promise<string[]>;
  abstract checkSeatAvailability(courseId: string): Promise<boolean>;
  abstract enrollStudent(userId: string, courseId: string): Promise<void>;
  abstract dropCourse(userId: string, courseId: string): Promise<void>;
  abstract createSubmission(assignmentId: string, userId: string, fileUrl: string): Promise<{ id: string; timestamp: Date }>;
}
