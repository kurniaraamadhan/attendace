import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Gunakan uSER (sesuai nama model di schema kamu)
    // Dan gunakan EMPLOYEE (sesuai enum Role di schema kamu)
    const totalCount = await prisma.user.count({
      where: {
        role: "EMPLOYEE", 
      },
    });

    return NextResponse.json({
      total: totalCount || 0,
      hadir: 0,
      terlambat: 0,
      izin: 0,
    });
  } catch (error: any) {
    console.error("STATS_ERROR:", error.message);
    return NextResponse.json(
      { total: 0, hadir: 0, terlambat: 0, izin: 0, error: error.message }, 
      { status: 500 }
    );
  }
}