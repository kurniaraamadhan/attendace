import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, parseISO, format } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month") || format(new Date(), "yyyy-MM");
    const userId = searchParams.get("userId"); // Untuk Audit Log

    const start = startOfMonth(parseISO(`${monthParam}-01`));
    const end = endOfMonth(parseISO(`${monthParam}-01`));

    // LOGIKA 1: Jika request meminta detail log per user (Audit Log)
    if (userId) {
      const details = await prisma.attendance.findMany({
        where: {
          userId: userId,
          checkIn: { gte: start, lte: end }
        },
        include: { shift: true },
        orderBy: { checkIn: "asc" }
      });
      return NextResponse.json(details);
    }

    // LOGIKA 2: Ringkasan Laporan Bulanan
    const employees = await prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      include: {
        attendances: {
          where: { checkIn: { gte: start, lte: end } }
        },
        permissions: {
          where: { 
            status: "APPROVED",
            // Perbaikan: Filter berdasarkan kolom 'date' (tanggal izin), bukan 'createdAt'
            date: { gte: start, lte: end } 
          }
        }
      }
    });

    const report = employees.map(emp => {
      // Menggunakan optional chaining (?.) atau fallback array [] untuk menghilangkan error .length merah
      const attendances = emp.attendances || [];
      const permissions = emp.permissions || [];

      const totalHadir = attendances.length;
      const totalIzin = permissions.length;
      const totalLate = attendances.filter(a => a.status === "LATE").length;
      
      const performance = totalHadir > 0 
        ? Math.round(((totalHadir - totalLate) / totalHadir) * 100) 
        : 0;

      return {
        id: emp.id,
        name: emp.name,
        totalHadir,
        totalIzin,
        totalLate,
        totalOntime: totalHadir - totalLate,
        performance
      };
    });

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Report Error:", error.message);
    return NextResponse.json({ error: "Gagal memuat laporan" }, { status: 500 });
  }
}