import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../../../prisma/prisma.service';
import { IStudentsRepository } from '../domain/students.repository.interface';
import { DashboardEntity, CourseProgressEntity } from '../domain/entities/dashboard.entity';

@Injectable()
export class StudentsRepository implements IStudentsRepository {

  async getDashboard(userId: string): Promise<DashboardEntity> {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            assignments: {
              include: { submissions: { where: { userId } } },
            },
          },
        },
      },
    });

    const courses = await Promise.all(
      enrollments.map(async (enr) => {
        const totalAssignments = enr.course.assignments.length;
        const submittedAssignments = enr.course.assignments.filter(
          (a) => a.submissions.length > 0,
        ).length;
        const progress = totalAssignments > 0 ? Math.round((submittedAssignments / totalAssignments) * 100) : 0;

        const upcomingDeadline = enr.course.assignments
          .filter((a) => a.dueDate && a.submissions.length === 0)
          .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1))[0];

        const pendingCount = enr.course.assignments.filter((a) => a.submissions.length === 0).length;

        return new CourseProgressEntity(
          enr.course.courseId,
          enr.course.name,
          progress,
          upcomingDeadline?.dueDate?.toISOString() ?? null,
          pendingCount,
        );
      }),
    );

    const notifications = await prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const todoItems = courses
      .filter((c) => c.pendingAssignments > 0)
      .map((c) => `${c.pendingAssignments} pending in ${c.name}`);

    return new DashboardEntity(
      courses,
      notifications.map((n) => n.message),
      todoItems,
    );
  }

  async findEnrolledCourseIds(userId: string): Promise<string[]> {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true },
    });
    return enrollments.map((e) => e.courseId);
  }

  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    return !!enrollment;
  }

  async checkPrerequisites(courseId: string): Promise<string[]> {
    return [];
  }

  async checkSeatAvailability(courseId: string): Promise<boolean> {
    const enrollmentCount = await prisma.enrollment.count({
      where: { courseId },
    });
    return enrollmentCount < 100;
  }

  async enrollStudent(userId: string, courseId: string): Promise<void> {
    await prisma.enrollment.create({
      data: { userId, courseId },
    });
  }

  async dropCourse(userId: string, courseId: string): Promise<void> {
    await prisma.enrollment.delete({
      where: { userId_courseId: { userId, courseId } },
    });
  }

  async createSubmission(assignmentId: string, userId: string, fileUrl: string) {
    const submission = await prisma.submission.create({
      data: { assignmentId, userId, fileUrl },
    });
    return { id: submission.id, timestamp: submission.timestamp };
  }
}
