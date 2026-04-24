import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@absensi.com' },
    update: {},
    create: {
      email: 'admin@absensi.com',
      name: 'Super Admin',
      password: 'admin123', // Nanti di production harus di-hash (bcrypt)
      role: 'ADMIN',
    },
  })
  
  // Buat setting default
  await prisma.systemSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      isSelfieRequired: true,
      officeStartTime: "08:00",
      officeEndTime: "17:00",
    }
  })

  console.log({ admin })
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })