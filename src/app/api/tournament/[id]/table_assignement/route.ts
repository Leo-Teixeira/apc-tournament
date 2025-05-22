import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = parseInt(params.id);
    if (isNaN(tournamentId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const assignements = await prisma.table_assignment.findMany({
      where: {
        tournament_table: {
          tournament_id: BigInt(tournamentId)
        },
        registration: { statut: "Confirmed" }
      },
      include: {
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
            }
          }
        },
        tournament_table: {
          select: {
            id: true,
            table_number: true,
            table_capacity: true
          }
        }
      }
    });

    return NextResponse.json(serializeBigInt(assignements));
  } catch (error) {
    console.error("Error fetching table assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = parseInt(params.id);
    if (isNaN(tournamentId)) {
      return NextResponse.json({ error: "Invalid tournament ID" }, { status: 400 });
    }

    const body = await req.json();
    const { table_number, table_capacity } = body;

    if (
      typeof table_number !== "number" ||
      typeof table_capacity !== "number" ||
      table_number <= 0 ||
      table_capacity <= 0
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const newTable = await prisma.tournament_table.create({
      data: {
        tournament_id: BigInt(tournamentId),
        table_number,
        table_capacity
      }
    });

    return NextResponse.json(serializeBigInt(newTable));
  } catch (error) {
    console.error("❌ Erreur ajout table :", error);
    return NextResponse.json(
      { error: "Erreur interne lors de l'ajout de la table" },
      { status: 500 }
    );
  }
}

