import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, month, overrideWorkType } = await req.json(); 

    // LOGIKA: Jika userId adalah "ALL", ambil semua karyawan
    let targetUserIds: string[] = [];
    if (userId === "ALL") {
      const allEmployees = await prisma.user.findMany({
        where: { role: "EMPLOYEE" },
        select: { id: true }
      });
      targetUserIds = allEmployees.map(u => u.id);
    } else {
      targetUserIds = [userId];
    }

    const [year, monthIdx] = month.split("-").map(Number);
    const daysInMonth = new Date(year, monthIdx, 0).getDate();

    // Loop untuk setiap user yang dipilih
    for (const id of targetUserIds) {
      const user = await prisma.user.findUnique({ where: { id: id } });
      if (!user) continue;

      const finalWorkType = overrideWorkType === "FOLLOW_DB" ? user.workType : overrideWorkType;

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthIdx - 1, day, 7, 0, 0, 0);
        const dayOfWeek = date.getDay(); 
        let shiftData = null;

        if (finalWorkType === "5HK") {
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            shiftData = {
              name: dayOfWeek === 5 ? "PAGI 5HK (JUMAT)" : "PAGI 5HK (NORMAL)",
              startIn: "07:00", endIn: "07:30",
              startOut: dayOfWeek === 5 ? "16:30" : "16:00",
              endOut: dayOfWeek === 5 ? "17:30" : "17:00"
            };
          }
        } else if (finalWorkType === "6HK") {
          if (dayOfWeek >= 1 && dayOfWeek <= 6) {
            let jamPulang = dayOfWeek === 5 ? "11:30" : dayOfWeek === 6 ? "13:00" : "14:00";
            shiftData = {
              name: `PAGI 6HK (${dayOfWeek === 5 ? "JUMAT" : dayOfWeek === 6 ? "SABTU" : "NORMAL"})`,
              startIn: "07:00", endIn: "07:30",
              startOut: jamPulang,
              endOut: (parseInt(jamPulang.split(':')[0]) + 1) + ":00"
            };
          }
        }

        if (shiftData) {
          const shift = await prisma.shift.upsert({
            where: { name: shiftData.name },
            update: {},
            create: { ...shiftData, tolerance: 15 }
          });

          await prisma.userSchedule.upsert({
            where: { userId_date: { userId: id, date } },
            update: { shiftId: shift.id },
            create: { userId: id, shiftId: shift.id, date }
          });
        } else {
          await prisma.userSchedule.deleteMany({ where: { userId: id, date } });
        }
      }
    }

    return NextResponse.json({ success: true, message: `Berhasil sinkronisasi ${targetUserIds.length} karyawan.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}