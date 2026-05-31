import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class AssignRoleRequestDto {
  @IsString()
  @IsNotEmpty()
  role: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  coursePermissions?: string[];
}
