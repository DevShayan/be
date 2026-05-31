import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UploadMaterialRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @IsString()
  @IsOptional()
  visibilityDate?: string;
}
