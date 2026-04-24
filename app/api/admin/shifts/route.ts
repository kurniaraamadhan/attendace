import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const shifts = await prisma.shift.findMany({
      orderBy: { startIn: "asc" } // SESUAIKAN: startTime -> startIn
    });
    return NextResponse.json(shifts || []);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, startIn, endIn, startOut, endOut, tolerance } = await req.json();
    const newShift = await prisma.shift.create({
      data: { 
        name, 
        startIn, 
        endIn, 
        startOut, 
        endOut,
        tolerance: parseInt(tolerance) || 0
      }
    });
    return NextResponse.json(newShift);
  } catch (error: any) {
    console.error("POST ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Update shift
export async function PATCH(req: Request) {
  try {
    const { id, name, startTime, endTime, tolerance } = await req.json();
    const updatedShift = await prisma.shift.update({
      where: { id },
      data: { 
        name, 
        startTime, 
        endTime, 
        tolerance: parseInt(tolerance) || 0
      }
    });
    return NextResponse.json(updatedShift);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update shift" }, { status: 500 });
  }
}