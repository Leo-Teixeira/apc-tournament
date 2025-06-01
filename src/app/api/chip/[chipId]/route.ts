import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  context: { params: { chipId: string } }
) {
  try {
    const chipId = BigInt(context.params.chipId);
    if (!chipId) {
      return NextResponse.json({ error: "Invalid chip ID" }, { status: 400 });
    }

    await prisma.stack_chip.deleteMany({
      where: { chip_id: chipId }
    });

    await prisma.chip.delete({
      where: { id: chipId }
    });

    return NextResponse.json({ message: "Chip deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting chip:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
