import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';

export function handlePrismaError(error: unknown): never {
  if (error instanceof HttpException) throw error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch ((error as Prisma.PrismaClientKnownRequestError).code) {
      case 'P2002':
        throw new ConflictException('A record with this value already exists');
      case 'P2025':
        throw new NotFoundException('The requested record was not found');
      default:
        throw new InternalServerErrorException('A database error occurred');
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new InternalServerErrorException('Unable to connect to the database');
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new InternalServerErrorException('Invalid database query');
  }

  throw new InternalServerErrorException('An unexpected error occurred');
}
