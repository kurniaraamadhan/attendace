import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Naikkan batas kirim data jadi 10MB
    },
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Data Izin Masuk:", body); // Cek apakah data sampai ke server

    const { userId, type, reason, image } = body;

    const newPermission = await prisma.permission.create({
      data: {
        userId,
        type,
        reason,
        image,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, data: newPermission });
  } catch (error: any) {
    // TAMPILKAN ERROR ASLI DI TERMINAL
    console.error("PRISMA ERROR:", error.message); 
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}