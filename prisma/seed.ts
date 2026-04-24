import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const masterShifts = [
    // --- KELOMPOK 5 HARI KERJA (5HK) ---
    { 
      name: 'PAGI 5HK (NORMAL)', // Sesuai logika API Generate
      startIn: '07:00', 
      endIn: '07:30', 
      startOut: '16:00', 
      endOut: '17:00', 
      tolerance: 15 
    },
    { 
      name: 'PAGI 5HK (JUMAT)', 
      startIn: '07:00', 
      endIn: '07:30', 
      startOut: '16:30', 
      endOut: '17:30', 
      tolerance: 15 
    },
    
    // --- KELOMPOK 6 HARI KERJA (6HK) ---
    { 
      name: 'PAGI 6HK (NORMAL)', // Senin - Kamis untuk 6HK
      startIn: '07:00', 
      endIn: '07:30', 
      startOut: '14:00', 
      endOut: '15:00', 
      tolerance: 15 
    },
    { 
      name: 'PAGI 6HK (JUMAT)', 
      startIn: '07:00', 
      endIn: '07:30', 
      startOut: '11:30', 
      endOut: '12:30', 
      tolerance: 15 
    },
    { 
      name: 'PAGI 6HK (SABTU)', 
      startIn: '07:00', 
      endIn: '07:30', 
      startOut: '13:00', 
      endOut: '14:00', 
      tolerance: 15 
    },
  ]

  console.log('⏳ Sedang menyinkronkan Master Shift...');

  for (const s of masterShifts) {
    await prisma.shift.upsert({
      where: { name: s.name }, 
      update: s, // Jika sudah ada, update jamnya sesuai seed terbaru
      create: s, // Jika belum ada, buat baru
    })
  }

  console.log('✅ Seed Master Shift Berhasil Disinkronkan!');
}

main()
  .catch((e) => {
    console.error('❌ Gagal Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });