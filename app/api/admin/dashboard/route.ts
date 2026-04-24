import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
  try {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    // 1. Hitung Total Karyawan
    const totalKaryawan = await prisma.user.count({ where: { role: "EMPLOYEE" } });

    // 2. Ambil Absensi Hari Ini
    const attendances = await prisma.attendance.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      include: {
        user: true,
        shift: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Hitung Statistik
    const hadirHariIni = attendances.length;
    const terlambat = attendances.filter((a) => a.status === "LATE").length;
    
    // 4. Hitung Izin/Sakit (Jika ada tabel Leave)
    const izinSakit = await prisma.leave.count({
      where: {
        status: "APPROVED",
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    return NextResponse.json({
      stats: {
        totalKaryawan,
        hadirHariIni,
        terlambat,
        izinSakit,
      },
      recentActivity: attendances.map((a) => ({
        id: a.id,
        name: a.user.name,
        shiftName: a.shift?.name || "No Shift",
        checkIn: a.checkIn,
        checkOut: a.checkOut,
        status: a.status,
        selfieIn: a.selfieIn,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}