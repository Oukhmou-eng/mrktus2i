import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateUtilisateurDto {
  @IsString()
  @IsNotEmpty()
  prenom?: string;

  @IsString()
  @IsNotEmpty()
  nom?: string;

  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsString()
  @Length(8)
  password?: string;

  @IsOptional()
  @IsString()
  tele?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsString()
  ville?: string;

  @IsOptional()
  @IsString()
  code_postal?: string;

  @IsOptional()
  @IsString()
  @IsIn(['user', 'admin'])
  role?: string;

  @IsOptional()
  @IsString()
  @IsIn(['actif', 'suspendu'])
  statut?: string;
}
