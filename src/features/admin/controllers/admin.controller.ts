import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from '../application/admin.service';
import { CreateUserRequestDto } from '../application/dtos/create-user-request.dto';
import { AssignRoleRequestDto } from '../application/dtos/assign-role-request.dto';
import { CreateCourseRequestDto } from '../application/dtos/create-course-request.dto';
import { ErrorHandlerService } from '../../../core/infrastructure/error-handler/error-handler.service';
import type { Request } from 'express';

@Controller('admin')
@UseGuards(AuthGuard('access'))
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  @Post('users')
  async createUser(@Req() req: Request, @Body() dto: CreateUserRequestDto) {
    try {
      if (req.user!.role !== 'admin') {
        throw this.errorHandlerService.handleError(new Error('Forbidden'));
      }
      const data = await this.adminService.createUser(dto);
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Get('users')
  async listUsers(@Req() req: Request) {
    try {
      if (req.user!.role !== 'admin') {
        throw this.errorHandlerService.handleError(new Error('Forbidden'));
      }
      const data = await this.adminService.listUsers();
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Patch('users/:userId/role')
  async assignRole(@Req() req: Request, @Param('userId') userId: string, @Body() dto: AssignRoleRequestDto) {
    try {
      if (req.user!.role !== 'admin') {
        throw this.errorHandlerService.handleError(new Error('Forbidden'));
      }
      const data = await this.adminService.assignRole(userId, dto);
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Delete('users/:userId')
  async deactivateUser(@Req() req: Request, @Param('userId') userId: string) {
    try {
      if (req.user!.role !== 'admin') {
        throw this.errorHandlerService.handleError(new Error('Forbidden'));
      }
      const data = await this.adminService.deactivateUser(userId);
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Post('courses')
  async createCourse(@Req() req: Request, @Body() dto: CreateCourseRequestDto) {
    try {
      if (req.user!.role !== 'admin') {
        throw this.errorHandlerService.handleError(new Error('Forbidden'));
      }
      const data = await this.adminService.createCourse(dto);
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Delete('courses/:courseId')
  async deleteCourse(@Req() req: Request, @Param('courseId') courseId: string) {
    try {
      if (req.user!.role !== 'admin') {
        throw this.errorHandlerService.handleError(new Error('Forbidden'));
      }
      const data = await this.adminService.deleteCourse(courseId);
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }
}
