import { Injectable } from '@nestjs/common';
import { prisma } from '../../../prisma/prisma.service';
import { ITeachersRepository } from '../domain/teachers.repository.interface';
import { GradebookEntity, StudentGradeEntity } from '../domain/entities/gradebook.entity';

@Injectable()
export class TeachersRepository implements ITeachersRepository {

  async findCoursesByTeacher(teacherId: string): Promise<string[]> {
    const courses = await prisma.course.findMany({
      where: { teacherId },
      select: { id: true },
    });
    return courses.map((c) => c.id);
  }

  async getGradebook(courseId: string): Promise<GradebookEntity> {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    const grades = await prisma.grade.findMany({
      where: { courseId },
    });

    const students = enrollments.map((enr) => {
      const studentGrades = grades.filter((g) => g.studentId === enr.user.id);
      const scores: Record<string, number> = {};
      let total = 0;
      for (const g of studentGrades) {
        scores[g.assignmentId || 'unknown'] = g.score;
        total += g.score;
      }
      const average = studentGrades.length > 0 ? parseFloat((total / studentGrades.length).toFixed(1)) : 0;
      return new StudentGradeEntity(enr.user.id, enr.user.name, scores, average);
    });

    return new GradebookEntity(courseId, students);
  }

  async upsertGrade(studentId: string, courseId: string, assignmentId: string, score: number): Promise<void> {
    const existing = await prisma.grade.findFirst({
      where: { studentId, courseId, assignmentId },
    });

    if (existing) {
      await prisma.grade.update({
        where: { id: existing.id },
        data: { score },
      });
    } else {
      await prisma.grade.create({
        data: { studentId, courseId, assignmentId, score },
      });
    }
  }

  async publishGrades(courseId: string): Promise<void> {
    await prisma.grade.updateMany({
      where: { courseId },
      data: { published: true },
    });
  }

  async getStudentAverage(studentId: string, courseId: string): Promise<number> {
    const grades = await prisma.grade.findMany({
      where: { studentId, courseId },
    });
    if (grades.length === 0) return 0;
    const total = grades.reduce((sum, g) => sum + g.score, 0);
    return total / grades.length;
  }

  async createNotification(userId: string, message: string): Promise<void> {
    await prisma.notification.create({
      data: { userId, message },
    });
  }
}
