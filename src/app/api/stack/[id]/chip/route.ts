import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const stack_id = parseInt(id);
    const body = await req.json();
    const { value, chip_image, chip_id } = body;

    console.log("📥 Reçu body :", body);
    console.log("🔢 stack_id reçu (casted) :", stack_id);

    if (isNaN(stack_id)) {
      console.log("❌ stack_id invalide après cast :", id);
      return NextResponse.json(
        { error: "Missing or invalid stack_id" },
        { status: 400 }
      );
    }

    let chip;

    if (chip_id) {
      console.log("🔍 Recherche d’un chip existant par ID :", chip_id);

      chip = await prisma.chip.findUnique({
        where: { id: BigInt(chip_id) }
      });

      if (!chip) {
        console.log("❌ Aucun chip trouvé avec cet ID");
        return NextResponse.json({ error: "Chip not found" }, { status: 404 });
      }

      console.log("✅ Chip trouvé :", chip);
    } else {
      console.log("🛠 Création d’un nouveau chip...");

      if (
        typeof value !== "number" ||
        !chip_image ||
        typeof chip_image !== "string"
      ) {
        console.log("❌ Données invalides pour création de chip");
        return NextResponse.json(
          { error: "Invalid payload for chip creation" },
          { status: 400 }
        );
      }

      chip = await prisma.chip.create({
        data: {
          value,
          chip_image
        }
      });

      console.log("✅ Nouveau chip créé :", chip);
    }

    console.log("🔗 Création de la relation stack_chip...");
    const relation = await prisma.stack_chip.create({
      data: {
        stack_id,
        chip_id: chip.id
      }
    });

    console.log("✅ Relation stack_chip créée :", relation);

    return NextResponse.json(serializeBigInt(chip), { status: 201 });
  } catch (error) {
    console.error("❌ Error creating or linking chip:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const stackIdParam = request.nextUrl.pathname.split("/").pop();
    if (!stackIdParam) {
      return NextResponse.json(
        { error: "Stack ID is required" },
        { status: 400 }
      );
    }

    const stack_id = parseInt(stackIdParam);
    if (isNaN(stack_id)) {
      console.log("❌ Invalid stack_id:", stackIdParam);
      return NextResponse.json({ error: "Invalid stack_id" }, { status: 400 });
    }

    const body = await request.json();
    const { chip_id } = body;

    if (!chip_id || isNaN(Number(chip_id))) {
      return NextResponse.json({ error: "Invalid chip_id" }, { status: 400 });
    }

    console.log(
      `🗑 Suppression du lien chip_id ${chip_id} du stack ${stack_id}...`
    );

    const result = await prisma.stack_chip.delete({
      where: {
        stack_id_chip_id: {
          stack_id,
          chip_id: BigInt(chip_id)
        }
      }
    });

    console.log("✅ Relation supprimée :", result);
    return NextResponse.json({ message: "Chip removed from stack" });
  } catch (error) {
    console.error("❌ Erreur suppression chip du stack :", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
