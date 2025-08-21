import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log("Received DELETE request for repechage id:", id);

    if (!id) {
      console.log("No id provided");
      return new Response(
        JSON.stringify({ error: "Missing id" }),
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    const idNum = Number(id);
    if (isNaN(idNum)) {
      console.log("Invalid id, not a number:", id);
      return new Response(
        JSON.stringify({ error: "Invalid id" }),
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    const repechageEntry = await prisma.repechage.findUnique({
      where: { id: BigInt(idNum) },
    });

    if (!repechageEntry) {
      console.log("Repechage entry not found:", idNum);
      return new Response(
        JSON.stringify({ error: "Repechage not found" }),
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    await prisma.repechage.delete({
      where: { id: BigInt(idNum) },
    });

    console.log("Deleted repechage id:", idNum);
    return new Response(
      JSON.stringify({ success: true, message: "Repechage deleted" }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Failed deleting repechage:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
}
