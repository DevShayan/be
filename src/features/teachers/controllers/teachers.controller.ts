import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TeachersService } from '../application/teachers.service';
import { UploadMaterialRequestDto } from '../application/dtos/upload-material-request.dto';
import { CreateAssignmentRequestDto } from '../application/dtos/create-assignment-request.dto';
import { EnterGradesRequestDto } from '../application/dtos/enter-grades-request.dto';
import { ErrorHandlerService } from '../../../core/infrastructure/error-handler/error-handler.service';
import type { Request } from 'express';

@Controller('teacher')
@UseGuards(AuthGuard('access'))
export class TeachersController {
  constructor(
    private readonly teachersService: TeachersService,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  @Get('courses')
  async getCourses(@Req() req: Request) {
    try {
      const data = await this.teachersService.getCourses(req.user!.id);
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Get('courses/:courseId/materials')
  async getMaterials(@Req() req: Request, @Param('courseId') courseId: string) {
    try {
      const data = await this.teachersService.getMaterials(req.user!.id, courseId);
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Post('courses/:courseId/materials')
  async uploadMaterial(@Req() req: Request, @Param('courseId') courseId: string, @Body() dto: UploadMaterialRequestDto) {
    try {
      const data = await this.teachersService.uploadMaterial(req.user!.id, courseId, dto);
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Put('courses/:courseId/materials/:materialId')
  async updateMaterial(
    @Req() req: Request,
    @Param('courseId') courseId: string,
    @Param('materialId') materialId: string,
    @Body() dto: UploadMaterialRequestDto,
  ) {
    try {
      await this.teachersService.updateMaterial(req.user!.id, courseId, materialId, dto);
      return { status: 'success', message: 'Material updated' };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Delete('courses/:courseId/materials/:materialId')
  async deleteMaterial(
    @Req() req: Request,
    @Param('courseId') courseId: string,
    @Param('materialId') materialId: string,
  ) {
    try {
      await this.teachersService.deleteMaterial(req.user!.id, courseId, materialId);
      return { status: 'success', message: 'Material deleted' };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Post('courses/:courseId/assignments')
  async createAssignment(
    @Req() req: Request,
    @Param('courseId') courseId: string,
    @Body() dto: CreateAssignmentRequestDto,
  ) {
    try {
      const data = await this.teachersService.createAssignment(req.user!.id, courseId, dto);
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Get('courses/:courseId/gradebook')
  async getGradebook(@Req() req: Request, @Param('courseId') courseId: string) {
    try {
      const data = await this.teachersService.getGradebook(req.user!.id, courseId);
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Put('courses/:courseId/grades')
  async enterGrades(@Req() req: Request, @Param('courseId') courseId: string, @Body() dto: EnterGradesRequestDto) {
    try {
      const data = await this.teachersService.enterGrades(req.user!.id, courseId, dto);
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }

  @Post('courses/:courseId/publish')
  async publishGrades(@Req() req: Request, @Param('courseId') courseId: string) {
    try {
      const data = await this.teachersService.publishGrades(req.user!.id, courseId);
      return { status: 'success', data };
    } catch (error) {
      throw this.errorHandlerService.handleError(error);
    }
  }
}
