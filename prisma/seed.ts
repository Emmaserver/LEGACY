import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'admin@legacy.com';
  const passwordPlano = 'Admin@123'; // trocar depois do primeiro login

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    console.log('Administrador já existe, nada a fazer.');
    return;
  }

  const passwordHash = await bcrypt.hash(passwordPlano, 10);

  const admin = await prisma.user.create({
    data: {
      nome: 'Administrador',
      email,
      passwordHash,
      papel: 'ADMINISTRADOR',
    },
  });

  console.log('Administrador criado com sucesso:', admin.email);
  console.log('Password inicial:', passwordPlano);
  console.log('IMPORTANTE: altera esta password assim que possível.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
