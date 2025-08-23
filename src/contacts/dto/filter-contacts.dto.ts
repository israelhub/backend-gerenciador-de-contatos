import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FilterContactsDto {
  @ApiProperty({
    description: 'Página (padrão: 1)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page deve ser um número' })
  @Min(1, { message: 'Page deve ser maior que 0' })
  page?: number = 1;

  @ApiProperty({
    description: 'Limite de itens por página (padrão: 10)',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit deve ser um número' })
  @Min(1, { message: 'Limit deve ser maior que 0' })
  limit?: number = 10;

  @ApiProperty({
    description: 'Filtro por nome',
    example: 'Maria',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  nome?: string;

  @ApiProperty({
    description: 'Filtro por categoria',
    example: 'pessoal',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Categoria deve ser uma string' })
  categoria?: string;

  @ApiProperty({
    description: 'Filtro por email',
    example: 'maria@exemplo.com',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Email deve ser uma string' })
  email?: string;

  @ApiProperty({
    description: 'Filtro por telefone',
    example: '(11) 99999-9999',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  telefone?: string;
}
