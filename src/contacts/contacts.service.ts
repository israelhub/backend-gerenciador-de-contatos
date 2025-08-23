import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';

import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { FilterContactsDto } from './dto/filter-contacts.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async create(
    ownerId: string,
    createContactDto: CreateContactDto,
  ): Promise<Contact> {
    const { foto, ...restDto } = createContactDto;

    const contact = this.contactRepository.create({
      ...restDto,
      ownerId,
      foto: foto ? Buffer.from(foto, 'base64') : undefined,
    });

    return this.contactRepository.save(contact);
  }

  async findAll(ownerId: string, filterDto: FilterContactsDto) {
    const {
      page = 1,
      limit = 10,
      nome,
      categoria,
      email,
      telefone,
    } = filterDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Contact> = {
      ownerId,
    };

    // Aplicar filtros
    if (nome) {
      where.nome = Like(`%${nome}%`);
    }

    if (categoria) {
      where.categoria = Like(`%${categoria}%`);
    }

    if (email) {
      where.email = Like(`%${email}%`);
    }

    if (telefone) {
      where.telefone = Like(`%${telefone}%`);
    }

    const [contacts, total] = await this.contactRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        nome: 'ASC',
      },
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      contacts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  async findOne(id: string, ownerId: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }

    // Verificar ownership
    if (contact.ownerId !== ownerId) {
      throw new ForbiddenException('Acesso negado ao contato');
    }

    return contact;
  }

  async update(
    id: string,
    ownerId: string,
    updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    const contact = await this.findOne(id, ownerId);

    const { foto, ...restDto } = updateContactDto;

    // Atualizar campos
    Object.assign(contact, restDto);

    // Converter foto de base64 para Buffer se fornecida
    if (foto !== undefined) {
      contact.foto = foto ? Buffer.from(foto, 'base64') : undefined;
    }

    return this.contactRepository.save(contact);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const contact = await this.findOne(id, ownerId);

    await this.contactRepository.remove(contact);
  }

  // Método para busca por texto livre
  async search(ownerId: string, searchTerm: string, limit = 10) {
    const contacts = await this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.ownerId = :ownerId', { ownerId })
      .andWhere(
        '(contact.nome ILIKE :searchTerm OR contact.email ILIKE :searchTerm OR contact.telefone ILIKE :searchTerm OR contact.categoria ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` },
      )
      .limit(limit)
      .orderBy('contact.nome', 'ASC')
      .getMany();

    return contacts;
  }
}
