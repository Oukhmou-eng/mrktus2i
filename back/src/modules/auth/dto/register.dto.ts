import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Match } from '../../../common/decorators/match.decorator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  nom: string;

  @IsNotEmpty({ message: 'Le prénom est obligatoire.' })
  prenom: string;

  @IsEmail({}, { message: 'Email invalide.' })
  @IsNotEmpty({ message: "L'email est obligatoire." })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères.',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'La confirmation du mot de passe est obligatoire.' })
  @Match('password', { message: 'Les mots de passe ne correspondent pas.' })
  confirmPassword: string;
}