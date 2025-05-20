// src/app/(withoutSidebar)/game/[id]/layout.tsx
"use client";

import "@/app/globals.css";
import { TournamentProvider } from "@/app/providers/TournamentContextProvider";

export default function GameLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  return (
    <TournamentProvider tournamentId={params.id}>{children}</TournamentProvider>
  );
}
