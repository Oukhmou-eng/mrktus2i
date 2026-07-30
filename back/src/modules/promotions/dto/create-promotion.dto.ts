import { IsInt, IsOptional, Min, IsString } from 'class-validator';

export class CreatePromotionDto {
  @IsInt()
  id_produit!: number;

  @IsInt()
  plan_tarif_id!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priorite?: number;

  @IsOptional()
  @IsString()
  type_facture?: string;

  @IsOptional()
  @IsInt()
  reference_id?: number;

  @IsOptional()
  @IsInt()
  moyen_paiement_id?: number;

  @IsOptional()
  @IsString()
  reference_transaction?: string;

  @IsOptional()
  @IsString()
  date_paiement?: string;

  @IsOptional()
  @IsString()
  date_debut?: string;

  @IsOptional()
  @IsString()
  date_fin?: string;

  // Card fields (simulation only)
  @IsOptional()
  @IsString()
  card_number?: string;

  @IsOptional()
  @IsString()
  card_holder?: string;

  @IsOptional()
  @IsString()
  card_expiration?: string;

  @IsOptional()
  @IsString()
  card_cvv?: string;
}
