import { stackMock } from "@/mock/stack.mock";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

const isMock = process.env.MOCK === "true";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (isMock) {
    const result = stackMock.find((stack) => String(stack.id) === id);
    return NextResponse.json(JSON.parse(JSON.stringify(result ?? {})));
  }

  try {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await prisma.stack.findUnique({
      where: { id: numericId },
      include: {
        stack_chip: {
          include: {
            chip: true
          }
        }
      }
    });

    if (!result) {
      return NextResponse.json({ error: "Stack not found" }, { status: 404 });
    }

    return NextResponse.json(serializeBigInt(result));
  } catch (error) {
    console.error("Error fetching stack by ID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stackId = parseInt(params.id);
    if (isNaN(stackId)) {
      console.log("❌ stackId invalide :", params.id);
      return NextResponse.json({ error: "Invalid stack ID" }, { status: 400 });
    }

    const body = await req.json();
    const {
      tournament_id,
      selected_stack_id,
      stack_total_player,
      stack_chip: updatedChips
    } = body;

    console.log("📥 Reçu PATCH stack:", {
      tournament_id,
      selected_stack_id,
      stack_total_player,
      updatedChips
    });

    const updates: Promise<any>[] = [];
    console.log("📦 Chips reçus (stack_chip):", updatedChips);

    if (tournament_id && selected_stack_id && selected_stack_id !== stackId) {
      console.log("📌 Mise à jour du tournoi : changement de stack");
      updates.push(
        prisma.tournament.update({
          where: { id: BigInt(tournament_id) },
          data: {
            tournament_stack: selected_stack_id
          }
        })
      );
    }

    if (typeof stack_total_player === "number") {
      const currentStack = await prisma.stack.findUnique({
        where: { id: selected_stack_id },
        select: { stack_total_player: true }
      });

      if (!currentStack) {
        console.log("❌ Stack non trouvé pour stack_total_player");
      } else if (currentStack.stack_total_player !== stack_total_player) {
        console.log(
          `🔁 Mise à jour stack_total_player de ${currentStack.stack_total_player} → ${stack_total_player}`
        );
        updates.push(
          prisma.stack.update({
            where: { id: selected_stack_id },
            data: { stack_total_player }
          })
        );
      } else {
        console.log("✅ stack_total_player inchangé");
      }
    }

    if (Array.isArray(updatedChips)) {
      for (const sc of updatedChips) {
        if (
          (!sc.chip_id || sc.chip_id === 0) &&
          sc.chip &&
          typeof sc.chip.value === "number" &&
          typeof sc.chip.chip_image === "string" &&
          sc.chip.chip_image.trim() !== ""
        ) {
          console.log("➕ Création d’un nouveau chip :", sc.chip);

          const createdChip = await prisma.chip.create({
            data: {
              value: sc.chip.value,
              chip_image: sc.chip.chip_image
            }
          });

          console.log("✅ Chip créé avec ID :", createdChip.id);

          updates.push(
            prisma.stack_chip.create({
              data: {
                stack_id: selected_stack_id,
                chip_id: createdChip.id
              }
            })
          );
        } else {
          console.log("⚠️ Chip ignoré (déjà existant ou invalide) :", sc);
        }
      }
    }

    if (updates.length === 0) {
      console.log("✅ Aucune mise à jour nécessaire");
      return NextResponse.json(
        { message: "No changes detected" },
        { status: 200 }
      );
    }

    await Promise.all(updates);
    console.log("✅ Toutes les mises à jour ont été appliquées");

    return NextResponse.json({ message: "Stack update(s) applied" });
  } catch (error) {
    console.error("❌ Error updating stack:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
