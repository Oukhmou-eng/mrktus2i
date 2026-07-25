import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CreatePanierItemDto {
  id_user: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_produit: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantite: number;
}
