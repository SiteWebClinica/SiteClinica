import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Criptografando a senha "12345"
  const hashedPassword = await bcrypt.hash('12345', 10);

  // 2. Criando o usuário no banco de dados com todas as permissões
  const user = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {
      password: hashedPassword, // Atualiza a senha se já existir
      role: 'ADMIN',
      status: 'APPROVED',
      active: true,
      permissions: {
        fullAccess: true,
        modules: ['users', 'appointments', 'patients', 'sales', 'services', 'professionals'],
        actions: ['create', 'read', 'update', 'delete']
      }
    },
    create: {
      name: 'Super Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      userType: 'admin',
      status: 'APPROVED',
      active: true,
      role: 'ADMIN',
      permissions: {
        fullAccess: true,
        modules: ['users', 'appointments', 'patients', 'sales', 'services', 'professionals'],
        actions: ['create', 'read', 'update', 'delete']
      },
    },
  });

  console.log('✅ Usuário administrador criado/atualizado com sucesso!');
  console.log(`Email: ${user.email}`);
  console.log(`Senha: 12345`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar usuário:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
