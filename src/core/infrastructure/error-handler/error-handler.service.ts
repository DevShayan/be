import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class ErrorHandlerService {
  handleError(error: unknown): HttpException {
    console.log(error);
    if (error instanceof HttpException) {
      return error;
    }

    if (error instanceof Error) {
      switch (true) {
        case error.message.includes('not found'):
          return new NotFoundException(error.message);
        case error.message.includes('already exists'):
          return new ConflictException(error.message);
        case error.message.includes('unauthorized'):
        case error.message.includes('Unauthorized'):
          return new UnauthorizedException(error.message);
        case error.message.includes('forbidden'):
        case error.message.includes('Forbidden'):
          return new ForbiddenException(error.message);
        case error.message.includes('invalid'):
        case error.message.includes('Invalid'):
          return new BadRequestException(error.message);
        default:
          return new InternalServerErrorException('An unexpected error occurred');
      }
    }

    return new InternalServerErrorException('An unexpected error occurred');
  }
}
