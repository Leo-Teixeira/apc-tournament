import { stackMock } from "@/mock/stack.mock";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, {}: {}) {
  const result = stackMock;
  return NextResponse.json(JSON.parse(JSON.stringify(result ?? {})));
}
