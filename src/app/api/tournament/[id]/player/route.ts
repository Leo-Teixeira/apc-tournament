import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = parseInt(params.id);
    const body = await req.json();
    const { pseudo, firstName, lastName } = body;

    if (isNaN(tournamentId) || !pseudo) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const alreadyRegistered = await prisma.registration.findMany({
      where: {
        tournament_id: BigInt(tournamentId),
        wp_users: {
          pseudo_winamax: pseudo
        }
      }
    });

    if (alreadyRegistered.length > 0) {
      return NextResponse.json(
        { error: "Player already registered" },
        { status: 409 }
      );
    }

    let user = await prisma.wp_users.findFirst({
      where: { pseudo_winamax: pseudo }
    });

    if (!user) {
      user = await prisma.wp_users.create({
        data: {
          user_login: pseudo,
          user_pass: "",
          user_nicename: `${firstName} ${lastName}`,
          user_email: `${pseudo}@external.com`,
          display_name: `${firstName} ${lastName}`,
          pseudo_winamax: pseudo,
          user_registered: new Date()
        }
      });

      await prisma.wp_usermeta.create({
        data: {
          user_id: user.ID,
          meta_key: "wp_capabilities",
          meta_value: 'a:1:{s:14:"membre_externe";b:1;}'
        }
      });
    }

    await prisma.registration.create({
      data: {
        user_id: user.ID,
        tournament_id: BigInt(tournamentId),
        statut: "Confirmed",
        inscription_date: new Date()
      }
    });

    const tables = await prisma.tournament_table.findMany({
      where: { tournament_id: BigInt(tournamentId) },
      include: { table_assignment: true }
    });

    if (tables.length === 0) {
      return NextResponse.json(
        serializeBigInt({
          message: "Player registered but no tables exist yet"
        })
      );
    }

    const hasFreeSpot = tables.some(
      (table) => table.table_assignment.length < table.table_capacity
    );

    if (!hasFreeSpot) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/tournament/${tournamentId}/table/regenerate`,
        {
          method: "POST"
        }
      );

      if (!res.ok) {
        return NextResponse.json(
          { error: "No available table and failed to regenerate" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        serializeBigInt({
          message: "Tables regenerated and player added"
        })
      );
    }

    const newRegistration = await prisma.registration.findFirst({
      where: {
        user_id: user.ID,
        tournament_id: BigInt(tournamentId)
      }
    });

    const targetTable = tables
      .filter((t) => t.table_assignment.length < t.table_capacity)
      .sort((a, b) => a.table_assignment.length - b.table_assignment.length)[0];

    if (targetTable && newRegistration) {
      await prisma.table_assignment.create({
        data: {
          registration_id: newRegistration.id,
          table_id: targetTable.id,
          table_seat_number: targetTable.table_assignment.length + 1,
          eliminated: false,
          user_kill_id: null
        }
      });
    }

    return NextResponse.json(
      serializeBigInt({
        message: "Player registered and assigned to a table"
      })
    );
  } catch (error) {
    console.error("Error registering player:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
