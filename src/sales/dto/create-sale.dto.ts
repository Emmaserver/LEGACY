import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class SaleItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantidade: number;
}

export class CreateSaleDto {
  @IsString()
  @IsOptional()
  clientId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  itens: SaleItemDto[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  valorPago?: number;
}
