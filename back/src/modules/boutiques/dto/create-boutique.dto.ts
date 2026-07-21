import { IsEmail, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateBoutiqueDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nom: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(255)
  logo_url?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(255)
  banniere_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  adresse?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  tele?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  emailprof?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  instagram?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  facebook?: string;
}
