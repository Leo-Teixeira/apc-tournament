"use client";
import { Card, CardBody, Chip, Tab, Tabs } from "@heroui/react";
import { STRINGS } from "../constants/string";

export default function DashboardHome() {
  return (
    <div className="flex flex-col gap-6">
      <h1>{STRINGS.apt.title}</h1>
      <div className="flex flex-col gap-3">
        <h2>{STRINGS.common.tournament_title}</h2>
        
      </div>
      <div className="flex flex-col gap-3">
        <h2>{STRINGS.common.classement_title}</h2>

      </div>
    </div>
  );
}
