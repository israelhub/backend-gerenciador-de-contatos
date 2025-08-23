import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsBase64,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({
    description: 'Nome do contato',
    example: 'Maria Santos',
  })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  nome: string;

  @ApiProperty({
    description: 'Foto do contato em formato base64',
    example:
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    required: false,
  })
  @IsOptional()
  @IsBase64({}, { message: 'Foto deve ser uma string base64 válida' })
  foto?: string;

  @ApiProperty({
    description: 'Categoria do contato',
    example: 'pessoal',
    enum: ['pessoal', 'trabalho', 'família'],
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Categoria deve ser uma string' })
  categoria?: string;

  @ApiProperty({
    description: 'Email do contato',
    example: 'maria@exemplo.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  email?: string;

  @ApiProperty({
    description: 'Telefone do contato (apenas números)',
    example: '11999999999',
    required: true,
  })
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @IsString({ message: 'Telefone deve ser uma string' })
  @Matches(/^\d{11}$/, {
    message:
      'Telefone deve conter exatamente 11 dígitos numéricos (ex: 11999999999)',
  })
  telefone: string;
}
