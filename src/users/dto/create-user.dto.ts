import { IsEmail, IsNotEmpty, IsString, IsEnum, MinLength } from 'class-validator';
import { Papel } from '../../generated/prisma/enums';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(Papel)
  papel: Papel;
}
