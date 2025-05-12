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
  const { id } = await params;
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
    const tables = await prisma.tournament_table.findMany({
      where: { tournament_id: BigInt(id) },
      include: {
        table_assignment: {
          include: {
            registration: {
              include: {
                wp_users: true,
                table_assignment: true,
                tournament_ranking: true
              }
            },
            tournament_table: true
          }
        }
      }
    });

    const result = tables.flatMap((table) =>
      table.table_assignment.map((assignement) => ({
        ...assignement,
        table: {
          id: table.id,
          table_number: table.table_number,
          table_capacity: table.table_capacity
        }
      }))
    );

    return NextResponse.json(serializeBigInt(result));
  } catch (error) {
    console.error("Error fetching table assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
