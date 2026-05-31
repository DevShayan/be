import { IsString, IsNotEmpty, IsArray, IsNumber, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class GradeEntryDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;
}

export class EnterGradesRequestDto {
  @IsString()
  @IsNotEmpty()
  assignmentId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeEntryDto)
  grades: GradeEntryDto[];
}
