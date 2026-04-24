import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ exists: false, error: "UserId required" });

    const now = new Date();
    const todayStart = startOfDay(now);
    const dayOfWeek = now.getDay(); // 0 = Minggu, 1 = Senin, dst.

    // 1. TENTUKAN SHIFT AKTIF
    let activeShift = null;

    // A. Cek Plotting Jadwal (Prioritas Utama untuk 2-2-2-2)
    const schedule = await prisma.userSchedule.findUnique({
      where: {
        userId_date: {
          userId: userId,
          date: todayStart,
        },
      },
      include: { shift: true },
    });

    if (schedule) {
      activeShift = schedule.shift;
    } else {
      // B. Cek Jadwal Tetap (Jika tidak ada plotting manual)
      const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { scheduleType: true } 
      });

      if (user?.scheduleType === "FIXED_MANAJEMEN" && dayOfWeek >= 1 && dayOfWeek <= 5) {
        activeShift = await prisma.shift.findFirst({ where: { name: "Pagi Panjang Manajemen" } });
      } else if (user?.scheduleType === "FIXED_UMUM" && dayOfWeek >= 1 && dayOfWeek <= 6) {
        activeShift = await prisma.shift.findFirst({ where: { name: "Pagi Panjang Umum" } });
      }
    }

    // 2. CARI DATA ABSENSI (Mendukung Shift Malam/Lintas Hari)
    // Cari record yang belum melakukan checkOut
    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: userId,
        checkOut: null, 
      },
      orderBy: { createdAt: 'desc' }
    });

    // 3. RETURN DATA KE FRONTEND
    return NextResponse.json({
      exists: !!attendance,
      checkIn: attendance?.checkIn || null,
      checkOut: attendance?.checkOut || null,
      activeShift: activeShift, // Berisi info jam masuk & toleransi
      isOffDay: !activeShift,   // Jika true, frontend harus menonaktifkan tombol
    });

  } catch (error: any) {
    console.error("Status Error:", error);
    return NextResponse.json({ exists: false, error: error.message }, { status: 500 });
  }
}