import { IsNumber, Min } from 'class-validator';

export class RegisterPaymentDto {
  @IsNumber()
  @Min(0.01)
  valor: number;
}
