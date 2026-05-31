import { Injectable } from '@nestjs/common';
import { prisma } from '../../../prisma/prisma.service';
import { IAdminRepository } from '../domain/admin.repository.interface';

@Injectable()
export class AdminRepository implements IAdminRepository {

  async createUser(data: { email: string; password: string; name: string; role: string; program?: string }) {
    const user = await prisma.user.create({ data });
    return { id: user.id };
  }

  async updateUserRole(userId: string, role: string, coursePermissions: string[]) {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    if (role === 'teacher' && coursePermissions.length > 0) {
      await prisma.course.updateMany({
        where: { courseId: { in: coursePermissions } },
        data: { teacherId: userId },
      });
    }
  }

  async deactivateUser(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
  }

  async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async findAllUsers() {
    return prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async createCourse(data: { courseId: string; name: string; credits: number; teacherId?: string }) {
    const course = await prisma.course.create({ data });
    return { courseId: course.courseId };
  }

  async deleteCourse(courseId: string) {
    const course = await prisma.course.findUnique({ where: { courseId } });
    if (course) {
      await prisma.course.delete({ where: { id: course.id } });
    }
  }
}
