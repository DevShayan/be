import { IsArray, IsString, IsNotEmpty } from 'class-validator';

export class RegisterCoursesRequestDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  courseIds: string[];
}
