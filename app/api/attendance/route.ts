import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

// Fungsi pembantu untuk validasi keterlambatan
function getAttendanceStatus(now: Date, limitTimeStr: string) {
  const [limitHour, limitMin] = limitTimeStr.split(":").map(Number);
  const limitDate = new Date(now);
  limitDate.setHours(limitHour, limitMin, 0, 0);
  return now > limitDate ? "LATE" : "ONTIME";
}

export async function POST(req: Request) {
  try {
    const { userId, selfieUrl, type, shiftId } = await req.json();
    const now = new Date();

    // 1. Ambil data shift untuk validasi jam
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift) {
      return NextResponse.json({ success: false, error: "Shift tidak ditemukan" }, { status: 400 });
    }

    // --- LOGIKA ABSEN MASUK (IN) ---
    if (type === "IN") {
      // Validasi: Cek apakah hari ini sudah pernah absen masuk (mencegah double IN)
      const existingIn = await prisma.attendance.findFirst({
        where: {
          userId,
          checkIn: {
            gte: startOfDay(now),
            lte: endOfDay(now),
          },
        },
      });

      if (existingIn) {
        return NextResponse.json({ success: false, error: "Anda sudah absen masuk hari ini!" }, { status: 400 });
      }

      // Validasi: Cek jam buka absen
      const [startHour, startMin] = shift.startIn.split(":").map(Number);
      const startDate = new Date(now);
      startDate.setHours(startHour, startMin, 0, 0);

      if (now < startDate) {
        return NextResponse.json({ 
          success: false, 
          error: `Absen belum dibuka. Mulai jam ${shift.startIn}` 
        }, { status: 400 });
      }

      // Tentukan status keterlambatan otomatis
      const statusKehadiran = getAttendanceStatus(now, shift.endIn);

      const newIn = await prisma.attendance.create({
        data: {
          userId,
          shiftId,
          selfieIn: selfieUrl,
          checkIn: now,
          status: statusKehadiran,
        },
      });

      return NextResponse.json({ success: true, data: newIn });
    }

    // --- LOGIKA ABSEN PULANG (OUT) ---
    if (type === "OUT") {
      // Cari record absen terakhir yang BELUM checkout (mendukung shift malam lintas hari)
      const attendanceRecord = await prisma.attendance.findFirst({
        where: {
          userId,
          checkOut: null,
        },
        orderBy: { checkIn: "desc" },
      });

      if (!attendanceRecord) {
        return NextResponse.json({ 
          success: false, 
          error: "Anda belum absen masuk atau sudah absen pulang!" 
        }, { status: 400 });
      }

      // Update record yang ada dengan data pulang
      const updatedOut = await prisma.attendance.update({
        where: { id: attendanceRecord.id },
        data: {
          checkOut: now,
          selfieOut: selfieUrl,
        },
      });

      return NextResponse.json({ success: true, data: updatedOut });
    }

    return NextResponse.json({ success: false, error: "Tipe absen tidak valid" }, { status: 400 });

  } catch (error: any) {
    console.error("Attendance Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}