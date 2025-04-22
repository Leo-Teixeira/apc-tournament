// /api/tournaments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export function GET(_: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ id: params.id, name: "Fake tournoi" });
}
