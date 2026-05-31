import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ITeachersRepository } from '../domain/teachers.repository.interface';
import { UploadMaterialParams, CreateAssignmentParams, EnterGradesParams } from '../domain/types';
import { prisma } from '../../../prisma/prisma.service';

@Injectable()
export class TeachersService {
  constructor(
    private readonly teachersRepository: ITeachersRepository,
  ) {}

  private async resolveCourse(courseCode: string) {
    const course = await prisma.course.findUnique({ where: { courseId: courseCode } });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  private async assertTeacherOwnsCourse(teacherId: string, courseCode: string) {
    const course = await this.resolveCourse(courseCode);
    if (course.teacherId !== teacherId) throw new ForbiddenException('You do not own this course');
    return course;
  }

  async getCourses(teacherId: string) {
    const courses = await prisma.course.findMany({
      where: { teacherId },
      select: { courseId: true, name: true, credits: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return courses;
  }

  async uploadMaterial(teacherId: string, courseCode: string, params: UploadMaterialParams) {
    const course = await this.assertTeacherOwnsCourse(teacherId, courseCode);

    const material = await prisma.material.create({
      data: {
        courseId: course.id,
        title: params.title,
        type: params.type,
        fileUrl: params.fileUrl,
        visibilityDate: params.visibilityDate ? new Date(params.visibilityDate) : null,
      },
    });

    return { materialId: material.id, message: 'Material uploaded' };
  }

  async getMaterials(teacherId: string, courseCode: string) {
    const course = await this.assertTeacherOwnsCourse(teacherId, courseCode);
    return prisma.material.findMany({
      where: { courseId: course.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateMaterial(teacherId: string, courseCode: string, materialId: string, params: Partial<UploadMaterialParams>) {
    const course = await this.assertTeacherOwnsCourse(teacherId, courseCode);

    const data: Record<string, unknown> = {};
    if (params.title) data.title = params.title;
    if (params.type) data.type = params.type;
    if (params.fileUrl) data.fileUrl = params.fileUrl;
    if (params.visibilityDate) data.visibilityDate = new Date(params.visibilityDate);

    return prisma.material.update({
      where: { id: materialId },
      data,
    });
  }

  async deleteMaterial(teacherId: string, courseCode: string, materialId: string) {
    await this.assertTeacherOwnsCourse(teacherId, courseCode);
    await prisma.material.delete({ where: { id: materialId } });
  }

  async createAssignment(teacherId: string, courseCode: string, params: CreateAssignmentParams) {
    const course = await this.assertTeacherOwnsCourse(teacherId, courseCode);

    const assignment = await prisma.assignment.create({
      data: {
        courseId: course.id,
        title: params.title,
        dueDate: params.dueDate ? new Date(params.dueDate) : null,
      },
    });

    return { assignmentId: assignment.id, message: 'Assignment created' };
  }

  async getGradebook(teacherId: string, courseCode: string) {
    const course = await this.assertTeacherOwnsCourse(teacherId, courseCode);
    return this.teachersRepository.getGradebook(course.id);
  }

  async enterGrades(teacherId: string, courseCode: string, params: EnterGradesParams) {
    const course = await this.assertTeacherOwnsCourse(teacherId, courseCode);

    let flaggedCount = 0;
    for (const entry of params.grades) {
      await this.teachersRepository.upsertGrade(entry.studentId, course.id, params.assignmentId, entry.score);

      const avg = await this.teachersRepository.getStudentAverage(entry.studentId, course.id);
      if (avg < 60) {
        flaggedCount++;
        await this.teachersRepository.createNotification(
          entry.studentId,
          `Your average in course ${courseCode} has dropped below 60%. Please review your performance.`,
        );
      }
    }

    return { message: `Grades updated. Flagged ${flaggedCount} students for review.` };
  }

  async publishGrades(teacherId: string, courseCode: string) {
    const course = await this.assertTeacherOwnsCourse(teacherId, courseCode);
    await this.teachersRepository.publishGrades(course.id);

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: course.id },
      select: { userId: true },
    });

    for (const enr of enrollments) {
      await this.teachersRepository.createNotification(
        enr.userId,
        `Grades have been published for course ${courseCode}.`,
      );
    }

    return { message: 'Grades published and visible to students' };
  }
}
