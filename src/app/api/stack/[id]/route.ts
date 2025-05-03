import { Tournament } from "@/app/types";
import { tournamentMocks } from "@/mock";
import { stackMock } from "@/mock/stack.mock";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  const result = stackMock.find((stack) => stack.id == id);
  return NextResponse.json(JSON.parse(JSON.stringify(result ?? {})));
}
