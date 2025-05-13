import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tableAssignementMocks } from "@/mock/table_assignement.mock";
import { tournamentTableMocks } from "@/mock/tournament_table.mock";
import { registrationMocks } from "@/mock/registration.mock";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const isMock = process.env.MOCK === "true";

  if (isMock) {
    const tournamentTables = tournamentTableMocks.filter((table) =>
      typeof table.tournament_id === "string"
        ? table.tournament_id === id
        : table.tournament_id.id === id
    );

    const tableIds = tournamentTables.map((table) => table.id);

    const assignements = tableAssignementMocks.filter((assignement) =>
      typeof assignement.table_id === "string"
        ? tableIds.includes(assignement.table_id)
        : tableIds.includes(assignement.table_id.id)
    );

    const enrichedAssignements = assignements.map((assignement) => {
      const registration = registrationMocks.find(
        (reg) =>
          reg.id ===
          (typeof assignement.registration_id === "string"
            ? assignement.registration_id
            : assignement.registration_id.id)
      );

      const table = tournamentTables.find(
        (tbl) =>
          tbl.id ===
          (typeof assignement.table_id === "string"
            ? assignement.table_id
            : assignement.table_id.id)
      );

      return {
        ...assignement,
        registration,
        table
      };
    });

    return NextResponse.json(enrichedAssignements);
  }

  try {
    const tournamentId = parseInt(id);
    if (isNaN(tournamentId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 404 });
    }

    const assignements = await prisma.table_assignment.findMany({
      where: {
        tournament_table: {
          tournament_id: BigInt(tournamentId)
        }
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
