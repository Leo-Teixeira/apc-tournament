"use client";

import { Button, HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import Dashboard from "./dashboard/page";

export default function Home() {
  const router = useRouter();

  return (
    <HeroUIProvider>
      <Dashboard />
    </HeroUIProvider>
  );
}
