import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const users = await prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      include: {
        schedules: {
          include: { 
            shift: true 
          },
          orderBy: {
            date: 'asc'
          }
        }
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET SCHEDULES ERROR:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}