import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔨 Criando usuário Admin...')

  // Criptografa a senha "admin" (nunca salve senha pura!)
  const passwordHash = await hash('admin', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'siteclinicaweb@gmail.com' },
    update: {
      // Se já existir, garante que a senha e o tipo estão certos
      password: passwordHash,
      userType: 'admin',
      color: '#0d9488' // Cor Teal (padrão do seu sistema)
    },
    create: {
      email: 'siteclinicaweb@gmail.com',
      name: 'Administrador',
      password: passwordHash,
      userType: 'admin', // Importante para o login identificar
      color: '#0d9488'   // Campo novo que adicionamos
    },
  })

  console.log(`✅ Usuário criado com sucesso: ${admin.email}`)
  console.log(`🔑 Senha: admin`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro ao criar admin:', e)
    await prisma.$disconnect()
    process.exit(1)
  })