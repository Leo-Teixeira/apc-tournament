import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tournamentMocks } from "@/mock";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const tournamentId = parseInt(id);

  if (isNaN(tournamentId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const isMock = process.env.MOCK === "true";

  if (isMock) {
    return NextResponse.json({ ...tournamentMocks, id });
  }

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: BigInt(id) },
      include: {
        tournament_level: true,
        tournament_chip_inventory: true,
        tournament_ranking: true,
        tournament_table: true,
        registration: {
          include: {
            wp_users: {
              select: {
                ID: true,
                pseudo_winamax: true,
                photo_url: true,
                display_name: true,
                user_status: true,
                user_url: true,
                user_email: true,
                user_nicename: true,
                user_login: true
              }
            },
            table_assignment: true,
            tournament_ranking: true
          }
        }
      }
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeBigInt(tournament));
  } catch (error) {
    console.error("Error fetching tournament:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();

    const updated = await prisma.tournament.update({
      where: { id: BigInt(params.id) },
      data: {
        tournament_name: data.tournament_name,
        tournament_description: data.tournament_description,
        tournament_start_date: new Date(data.tournament_start_date),
        tournament_end_date: new Date(data.tournament_end_date),
        tournament_trimestry: data.tournament_trimestry,
        tournament_category: data.tournament_category,
        tournament_status: data.tournament_status
      }
    });

    return NextResponse.json(serializeBigInt(updated));
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.tournament.delete({
      where: { id: BigInt(params.id) }
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
