import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, startOfDay } from "date-fns";

export async function POST(req: Request) {
  try {
    const { userId, startDate, startShiftType } = await req.json();
    
    // Ambil data semua shift dari database untuk referensi ID
    const shifts = await prisma.shift.findMany();
    const shiftPagi = shifts.find(s => s.name.includes("Pagi (2 Hari)"));
    const shiftSiang = shifts.find(s => s.name.includes("Siang"));
    const shiftMalam = shifts.find(s => s.name.includes("Malam"));

    if (!shiftPagi || !shiftSiang || !shiftMalam) {
      return NextResponse.json({ error: "Master Shift belum lengkap. Jalankan seed dulu." }, { status: 400 });
    }

    // Definisi Urutan Siklus (8 Hari)
    // 0,1: Pagi | 2,3: Siang | 4,5: Malam | 6,7: Libur (Tidak diinsert)
    const cycle = [
      shiftPagi.id, shiftPagi.id,
      shiftSiang.id, shiftSiang.id,
      shiftMalam.id, shiftMalam.id,
      null, null // Libur
    ];

    // Tentukan indeks awal berdasarkan pilihan admin (Pagi/Siang/Malam)
    let startIndex = 0;
    if (startShiftType === "SIANG") startIndex = 2;
    if (startShiftType === "MALAM") startIndex = 4;

    const results = [];
    let currentDate = new Date(startDate);

    // Kita plot untuk 32 hari ke depan (4 siklus penuh)
    for (let i = 0; i < 32; i++) {
      const shiftId = cycle[(startIndex + i) % 8];
      const targetDate = startOfDay(currentDate);

      if (shiftId) {
        // Simpan ke database (Upsert agar jika sudah ada tidak error)
        await prisma.userSchedule.upsert({
          where: {
            userId_date: { userId, date: targetDate }
          },
          update: { shiftId },
          create: { userId, shiftId, date: targetDate }
        });
        results.push({ date: targetDate, shiftId });
      }

      currentDate = addDays(currentDate, 1);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Jadwal 32 hari berhasil dibuat untuk user tersebut.` 
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}