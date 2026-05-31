import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAssignmentRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  dueDate?: string;
}
