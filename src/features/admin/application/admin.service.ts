import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { IAdminRepository } from '../domain/admin.repository.interface';
import { IHashingService } from '../../../core/domain/interfaces/hashing.interface';
import { CreateUserParams, AssignRoleParams, CreateCourseParams } from '../domain/types';
import { prisma } from '../../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: IAdminRepository,
    private readonly hashingService: IHashingService,
  ) {}

  async createUser(params: CreateUserParams) {
    const existing = await prisma.user.findUnique({ where: { email: params.email } });
    if (existing) throw new ConflictException('Email already exists');

    const tempPassword = 'Welcome@123';
    const hashedPassword = await this.hashingService.hash(tempPassword);

    const user = await this.adminRepository.createUser({
      email: params.email,
      password: hashedPassword,
      name: params.name,
      role: params.role,
      program: params.program,
    });

    return { userId: user.id, tempPassword };
  }

  async assignRole(userId: string, params: AssignRoleParams) {
    const user = await this.adminRepository.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    await this.adminRepository.updateUserRole(userId, params.role, params.coursePermissions || []);

    return { message: 'Role and permissions updated' };
  }

  async deactivateUser(userId: string) {
    const user = await this.adminRepository.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    await this.adminRepository.deactivateUser(userId);
    return { message: 'User account deactivated' };
  }

  async listUsers() {
    return this.adminRepository.findAllUsers();
  }

  async createCourse(params: CreateCourseParams) {
    const existing = await prisma.course.findUnique({ where: { courseId: params.courseId } });
    if (existing) throw new ConflictException('Course already exists');

    return this.adminRepository.createCourse(params);
  }

  async deleteCourse(courseId: string) {
    const course = await prisma.course.findUnique({ where: { courseId } });
    if (!course) throw new NotFoundException('Course not found');

    await this.adminRepository.deleteCourse(courseId);
    return { message: 'Course removed' };
  }
}
