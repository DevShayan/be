import { IsString, IsNotEmpty } from 'class-validator';

export class SubmitAssignmentRequestDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  assignmentId: string;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;
}
