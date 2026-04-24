import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID diperlukan" }, { status: 400 });
    }

    const now = new Date();

    // 1. Ambil semua riwayat untuk list
    const history = await prisma.attendance.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });

    // 2. Hitung total hadir bulan ini (berdasarkan record yang ada checkIn-nya)
    const totalHadirBulanIni = await prisma.attendance.count({
      where: {
        userId: userId,
        createdAt: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
    });

    return NextResponse.json({
      history,
      totalHadirBulanIni
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil riwayat" }, { status: 500 });
  }
}