import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id || typeof id !== "number") {
      return NextResponse.json({ error: "Invalid or missing repechage id" }, { status: 400 });
    }

    // Vérifier si l'entrée repechage existe
    const repechageEntry = await prisma.repechage.findUnique({
      where: { id: BigInt(id) },
    });

    if (!repechageEntry) {
      return NextResponse.json({ error: "Repechage entry not found" }, { status: 404 });
    }

    // Supprimer l'entrée repechage
    await prisma.repechage.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ success: true, message: "Repechage entry deleted" });
  } catch (error) {
    console.error("Error deleting repechage entry:", error);
    return NextResponse.json({ error: "Failed to delete repechage entry" }, { status: 500 });
  }
}
