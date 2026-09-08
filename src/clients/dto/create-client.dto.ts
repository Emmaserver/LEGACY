import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { TipoCliente } from '../../generated/prisma/enums';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  telefone: string;

  @IsString()
  @IsOptional()
  documento?: string;

  @IsEnum(TipoCliente)
  tipo: TipoCliente;

  @IsBoolean()
  @IsOptional()
  permiteFiado?: boolean;
}
