import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IStudentsRepository } from '../domain/students.repository.interface';
import { SubmitAssignmentParams, RegisterCoursesParams, GradesResponse, GradeResult } from '../domain/types';
import { prisma } from '../../../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentsRepository: IStudentsRepository,
  ) {}

  async getDashboard(userId: string) {
    return this.studentsRepository.getDashboard(userId);
  }

  async getCatalog(search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { courseId: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return prisma.course.findMany({
      where,
      select: { courseId: true, name: true, credits: true },
    });
  }

  async registerCourses(userId: string, params: RegisterCoursesParams) {
    const registered: string[] = [];
    const failed: { courseId: string; reason: string }[] = [];

    for (const courseId of params.courseIds) {
      const course = await prisma.course.findUnique({ where: { courseId } });
      if (!course) {
        failed.push({ courseId, reason: 'Course not found' });
        continue;
      }

      const alreadyEnrolled = await this.studentsRepository.isEnrolled(userId, course.id);
      if (alreadyEnrolled) {
        failed.push({ courseId, reason: 'Already enrolled' });
        continue;
      }

      const seatAvailable = await this.studentsRepository.checkSeatAvailability(course.id);
      if (!seatAvailable) {
        failed.push({ courseId, reason: 'No seats available' });
        continue;
      }

      await this.studentsRepository.enrollStudent(userId, course.id);
      registered.push(courseId);
    }

    return { registered, failed };
  }

  async dropCourse(userId: string, courseId: string) {
    const course = await prisma.course.findUnique({ where: { courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const enrolled = await this.studentsRepository.isEnrolled(userId, course.id);
    if (!enrolled) throw new BadRequestException('Not enrolled in this course');

    await this.studentsRepository.dropCourse(userId, course.id);
  }

  async submitAssignment(userId: string, params: SubmitAssignmentParams) {
    const allowedExtensions = ['.pdf'];
    const ext = params.fileUrl.toLowerCase().slice(params.fileUrl.lastIndexOf('.'));
    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestException('Invalid file format. Please upload PDF.');
    }

    const course = await prisma.course.findUnique({ where: { courseId: params.courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const enrolled = await this.studentsRepository.isEnrolled(userId, course.id);
    if (!enrolled) throw new ForbiddenException('Not enrolled in this course');

    const assignment = await prisma.assignment.findUnique({ where: { id: params.assignmentId } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.courseId !== course.id) throw new BadRequestException('Assignment does not belong to this course');

    const existing = await prisma.submission.findUnique({
      where: { assignmentId_userId: { assignmentId: params.assignmentId, userId } },
    });
    if (existing) throw new BadRequestException('Assignment already submitted');

    const result = await this.studentsRepository.createSubmission(params.assignmentId, userId, params.fileUrl);

    return {
      submissionId: result.id,
      message: 'Assignment submitted successfully',
      timestamp: result.timestamp.toISOString(),
    };
  }

  async getGrades(userId: string, semester?: string) {
    const grades = await prisma.grade.findMany({
      where: { studentId: userId, published: true },
      include: { course: true },
    });

    const courseMap = new Map<string, { total: number; count: number; name: string }>();
    for (const g of grades) {
      if (!courseMap.has(g.courseId)) {
        courseMap.set(g.courseId, { total: 0, count: 0, name: g.course.name });
      }
      const entry = courseMap.get(g.courseId)!;
      entry.total += g.score;
      entry.count += 1;
    }

    const courses: GradeResult[] = [];
    let overallTotal = 0;
    let overallCount = 0;

    for (const [courseId, data] of courseMap) {
      const avg = data.total / data.count;
      const { letter, gpa } = this.toGrade(avg);
      courses.push({ courseId, name: data.name, grade: letter, gpa });
      overallTotal += gpa;
      overallCount += 1;
    }

    return {
      semester: semester || 'Current',
      courses,
      overallGPA: overallCount > 0 ? parseFloat((overallTotal / overallCount).toFixed(2)) : 0,
    } as GradesResponse;
  }

  private toGrade(score: number): { letter: string; gpa: number } {
    if (score >= 90) return { letter: 'A', gpa: 4.0 };
    if (score >= 80) return { letter: 'B+', gpa: 3.3 };
    if (score >= 70) return { letter: 'B', gpa: 3.0 };
    if (score >= 60) return { letter: 'C', gpa: 2.0 };
    if (score >= 50) return { letter: 'D', gpa: 1.0 };
    return { letter: 'F', gpa: 0.0 };
  }
}
