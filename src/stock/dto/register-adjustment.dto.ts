import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class RegisterAdjustmentDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  quantidade: number; // pode ser positivo ou negativo (ex: +5 ou -3)

  @IsString()
  @IsNotEmpty()
  motivo: string; // obrigatório em ajustes, para justificar a correção
}
