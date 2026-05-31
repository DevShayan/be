import { Injectable } from '@nestjs/common';
import { GradebookEntity } from './entities/gradebook.entity';

@Injectable()
export abstract class ITeachersRepository {
  abstract findCoursesByTeacher(teacherId: string): Promise<string[]>;
  abstract getGradebook(courseId: string): Promise<GradebookEntity>;
  abstract upsertGrade(studentId: string, courseId: string, assignmentId: string, score: number): Promise<void>;
  abstract publishGrades(courseId: string): Promise<void>;
  abstract getStudentAverage(studentId: string, courseId: string): Promise<number>;
  abstract createNotification(userId: string, message: string): Promise<void>;
}
