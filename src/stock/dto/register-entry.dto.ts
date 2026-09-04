import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';

export class RegisterEntryDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantidade: number;

  @IsString()
  @IsOptional()
  motivo?: string;
}
