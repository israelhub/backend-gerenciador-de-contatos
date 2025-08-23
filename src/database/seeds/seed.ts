import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../../users/entities/user.entity';
import { Contact } from '../../contacts/entities/contact.entity';

export const seedData = async (dataSource: DataSource) => {
  console.log('🌱 Iniciando seed de dados...');

  const userRepository = dataSource.getRepository(User);
  const contactRepository = dataSource.getRepository(Contact);

  try {
    // Verificar se já existem dados
    const existingUsersCount = await userRepository.count();
    if (existingUsersCount > 0) {
      console.log('📊 Dados já existem, pulando seed...');
      return;
    }

    // Senha padrão para ambos os usuários
    const hashedPassword = await argon2.hash('senha123');

    // 1. Criar primeiro usuário SEM contatos
    const userWithoutContacts = userRepository.create({
      nome: 'João Vazio',
      email: 'joao@vazio.com',
      senha: hashedPassword,
    });

    const savedUserWithoutContacts =
      await userRepository.save(userWithoutContacts);
    console.log(
      '👤 Usuário sem contatos criado:',
      savedUserWithoutContacts.email,
    );

    // 2. Criar segundo usuário COM 10 contatos
    const userWithContacts = userRepository.create({
      nome: 'Maria Popular',
      email: 'maria@popular.com',
      senha: hashedPassword,
    });

    const savedUserWithContacts = await userRepository.save(userWithContacts);
    console.log('👤 Usuário com contatos criado:', savedUserWithContacts.email);

    // Criar 10 contatos para o segundo usuário
    // Pequena imagem em base64 (1x1 pixel transparente PNG)
    const sampleImageBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    const contacts = [
      {
        nome: 'Ana Silva',
        email: 'ana@exemplo.com',
        telefone: '11999991111',
        categoria: 'pessoal',
        foto: Buffer.from(sampleImageBase64, 'base64'),
        ownerId: savedUserWithContacts.id,
      },
      {
        nome: 'Bruno Santos',
        email: 'bruno@trabalho.com',
        telefone: '11999992222',
        categoria: 'trabalho',
        ownerId: savedUserWithContacts.id,
      },
      {
        nome: 'Carlos Oliveira',
        email: 'carlos@familia.com',
        telefone: '11999993333',
        categoria: 'família',
        foto: Buffer.from(sampleImageBase64, 'base64'),
        ownerId: savedUserWithContacts.id,
      },
      {
        nome: 'Diana Costa',
        email: 'diana@pessoal.com',
        telefone: '11999994444',
        categoria: 'pessoal',
        ownerId: savedUserWithContacts.id,
      },
      {
        nome: 'Eduardo Lima',
        email: 'eduardo@trabalho.com',
        telefone: '11999995555',
        categoria: 'trabalho',
        foto: Buffer.from(sampleImageBase64, 'base64'),
        ownerId: savedUserWithContacts.id,
      },
      {
        nome: 'Fernanda Rocha',
        email: 'fernanda@exemplo.com',
        telefone: '11999996666',
        categoria: 'pessoal',
        ownerId: savedUserWithContacts.id,
      },
      {
        nome: 'Gabriel Mendes',
        email: 'gabriel@familia.com',
        telefone: '11999997777',
        categoria: 'família',
        foto: Buffer.from(sampleImageBase64, 'base64'),
        ownerId: savedUserWithContacts.id,
      },
      {
        nome: 'Helena Barros',
        email: 'helena@trabalho.com',
        telefone: '11999998888',
        categoria: 'trabalho',
        ownerId: savedUserWithContacts.id,
      },
      {
        nome: 'Igor Fernandes',
        email: 'igor@pessoal.com',
        telefone: '11999999999',
        categoria: 'pessoal',
        foto: Buffer.from(sampleImageBase64, 'base64'),
        ownerId: savedUserWithContacts.id,
      },
      {
        nome: 'Julia Alves',
        email: 'julia@familia.com',
        telefone: '11999990000',
        categoria: 'família',
        ownerId: savedUserWithContacts.id,
      },
    ];

    for (const contactData of contacts) {
      const contact = contactRepository.create(contactData);
      await contactRepository.save(contact);
      console.log(`📇 Contato criado: ${contact.nome}`);
    }

    console.log('✅ Seed concluído com sucesso!');
    console.log('👤 Usuários criados:');
    console.log(`   📧 ${savedUserWithoutContacts.email} (sem contatos)`);
    console.log(`   📧 ${savedUserWithContacts.email} (10 contatos)`);
    console.log('🔑 Senha para ambos: senha123');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
};
