import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { UnidadeMedida } from '../../generated/prisma/enums';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsEnum(UnidadeMedida)
  unidade: UnidadeMedida;

  @IsNumber()
  @Min(0)
  precoCusto: number;

  @IsNumber()
  @Min(0)
  precoVenda: number;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
