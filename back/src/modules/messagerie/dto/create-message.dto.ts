import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_conversation?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_boutique?: number;

  @IsNotEmpty({ message: 'Le contenu du message est requis.' })
  @IsString()
  contenu: string;

  @IsOptional()
  @IsString()
  @IsIn(['texte', 'image', 'video', 'fichier', 'produit', 'systeme'])
  type_message?: string;

  @IsOptional()
  @IsInt()
  id_produit?: number;
}
