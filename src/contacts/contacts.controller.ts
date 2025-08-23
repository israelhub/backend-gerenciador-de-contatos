import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { FilterContactsDto } from './dto/filter-contacts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthRequest } from '../common/interfaces/auth-request.interface';
import {
  serializeContact,
  serializeContacts,
} from './interfaces/serialized-contact.interface';

@ApiTags('Contacts')
@Controller('contacts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo contato' })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({
    status: 201,
    description: 'Contato criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        nome: { type: 'string' },
        foto: { type: 'string', nullable: true },
        categoria: { type: 'string', nullable: true },
        email: { type: 'string', nullable: true },
        telefone: { type: 'string', nullable: true },
        ownerId: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(
    @Request() req: AuthRequest,
    @Body() createContactDto: CreateContactDto,
  ) {
    const contact = await this.contactsService.create(
      req.user.id,
      createContactDto,
    );
    return serializeContact(contact);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contatos com filtros e paginação' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Itens por página (padrão: 10)',
  })
  @ApiQuery({
    name: 'nome',
    required: false,
    type: String,
    description: 'Filtro por nome',
  })
  @ApiQuery({
    name: 'categoria',
    required: false,
    type: String,
    description: 'Filtro por categoria',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    description: 'Filtro por email',
  })
  @ApiQuery({
    name: 'telefone',
    required: false,
    type: String,
    description: 'Filtro por telefone no formato E.164 (ex: +5511999999999)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de contatos',
    schema: {
      type: 'object',
      properties: {
        contacts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              nome: { type: 'string' },
              foto: { type: 'string', nullable: true },
              categoria: { type: 'string', nullable: true },
              email: { type: 'string', nullable: true },
              telefone: { type: 'string', nullable: true },
              ownerId: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'number' },
            totalPages: { type: 'number' },
            totalItems: { type: 'number' },
            itemsPerPage: { type: 'number' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findAll(
    @Request() req: AuthRequest,
    @Query() filterDto: FilterContactsDto,
  ) {
    const result = await this.contactsService.findAll(req.user.id, filterDto);
    return {
      ...result,
      contacts: serializeContacts(result.contacts),
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar contatos por termo' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Termo de busca',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limite de resultados (padrão: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados da busca',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          nome: { type: 'string' },
          foto: { type: 'string', nullable: true },
          categoria: { type: 'string', nullable: true },
          email: { type: 'string', nullable: true },
          telefone: { type: 'string', nullable: true },
          ownerId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async search(
    @Request() req: AuthRequest,
    @Query('q') searchTerm: string,
    @Query('limit') limit?: number,
  ) {
    const contacts = await this.contactsService.search(
      req.user.id,
      searchTerm,
      limit,
    );
    return serializeContacts(contacts);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter contato por ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID do contato',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do contato',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        nome: { type: 'string' },
        foto: { type: 'string', nullable: true },
        categoria: { type: 'string', nullable: true },
        email: { type: 'string', nullable: true },
        telefone: { type: 'string', nullable: true },
        ownerId: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Contato não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado ao contato' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findOne(
    @Request() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const contact = await this.contactsService.findOne(id, req.user.id);
    return serializeContact(contact);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar contato' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID do contato',
  })
  @ApiBody({ type: UpdateContactDto })
  @ApiResponse({
    status: 200,
    description: 'Contato atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        nome: { type: 'string' },
        foto: { type: 'string', nullable: true },
        categoria: { type: 'string', nullable: true },
        email: { type: 'string', nullable: true },
        telefone: { type: 'string', nullable: true },
        ownerId: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Contato não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado ao contato' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async update(
    @Request() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    const contact = await this.contactsService.update(
      id,
      req.user.id,
      updateContactDto,
    );
    return serializeContact(contact);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir contato' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID do contato',
  })
  @ApiResponse({ status: 200, description: 'Contato excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Contato não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado ao contato' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async remove(
    @Request() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.contactsService.remove(id, req.user.id);
    return { message: 'Contato excluído com sucesso' };
  }
}
