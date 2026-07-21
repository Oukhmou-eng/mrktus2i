import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @IsNumber()
  id_user: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type: string;

  @IsString()
  @IsNotEmpty()
  contenu: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  lien?: string;

  @IsOptional()
  @IsBoolean()
  lu?: boolean;
}
