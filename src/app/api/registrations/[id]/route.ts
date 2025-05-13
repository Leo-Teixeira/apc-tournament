import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registrationMocks } from "@/mock";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

const MOCK_MODE = process.env.MOCK === "true";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    return NextResponse.json(
      { error: "Invalid tournament ID" },
      { status: 400 }
    );
  }

  if (MOCK_MODE) {
    const result = registrationMocks.filter((r) => {
      const tournament = r.tournament_id;
      return String(tournament.id) === id;
    });

    return NextResponse.json(result);
  }

  try {
    const registrations = await prisma.registration.findMany({
      where: {
        tournament_id: numericId
      },
      include: {
        tournament: true
      }
    });

    return NextResponse.json(serializeBigInt(registrations));
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
