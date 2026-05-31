import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserRequestDto {
  @IsString()
  @IsNotEmpty()
  role: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  program?: string;
}
