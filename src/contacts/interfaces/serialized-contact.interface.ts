import { Contact } from '../entities/contact.entity';

export interface SerializedContact {
  id: string;
  nome: string;
  foto?: string | null;
  categoria?: string;
  email?: string;
  telefone: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export function serializeContact(contact: Contact): SerializedContact {
  return {
    id: contact.id,
    nome: contact.nome,
    foto: contact.foto ? contact.foto.toString('base64') : null,
    categoria: contact.categoria,
    email: contact.email,
    telefone: contact.telefone,
    ownerId: contact.ownerId,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  };
}

export function serializeContacts(contacts: Contact[]): SerializedContact[] {
  return contacts.map(serializeContact);
}
