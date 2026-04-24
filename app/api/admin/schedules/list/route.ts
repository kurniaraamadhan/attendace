import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || new Date().getMonth().toString();

    const users = await prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      include: {
        schedules: {
          where: {
            date: {
              gte: startOfMonth(new Date()),
              lte: endOfMonth(new Date()),
            }
          },
          include: { shift: true }
        }
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}