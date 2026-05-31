import { Controller, Get, Post, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudentsService } from '../application/students.service';
import { SubmitAssignmentRequestDto } from '../application/dtos/submit-assignment-request.dto';
import { RegisterCoursesRequestDto } from '../application/dtos/register-courses-request.dto';
import { ErrorHandlerService } from '../../../core/infrastructure/error-handler/error-handler.service';
import type { Request } from 'express';

@Controller('student')
@UseGuards(AuthGuard('access'))
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  @Get('dashboard')
  async getDashboard(@Req() req: Request) {
    try {
      const data = await this.studentsService.getDashboard(req.user!.id);
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Get('courses/catalog')
  async getCatalog(@Query('search') search?: string) {
    try {
      const data = await this.studentsService.getCatalog(search);
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Post('courses/register')
  async registerCourses(@Req() req: Request, @Body() dto: RegisterCoursesRequestDto) {
    try {
      const result = await this.studentsService.registerCourses(req.user!.id, dto);
      const failed = result.failed.map((f) => f.courseId);
      return {
        status: 'success',
        data: {
          registered: result.registered,
          failed,
          message: failed.length > 0 ? 'Partial registration completed' : 'Registration successful',
        },
      };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Delete('courses/:courseId')
  async dropCourse(@Req() req: Request, @Param('courseId') courseId: string) {
    try {
      await this.studentsService.dropCourse(req.user!.id, courseId);
      return { status: 'success', message: 'Course dropped successfully' };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Post('assignments/submit')
  async submitAssignment(@Req() req: Request, @Body() dto: SubmitAssignmentRequestDto) {
    try {
      const data = await this.studentsService.submitAssignment(req.user!.id, dto);
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Get('grades')
  async getGrades(@Req() req: Request, @Query('semester') semester?: string) {
    try {
      const data = await this.studentsService.getGrades(req.user!.id, semester);
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }
}
