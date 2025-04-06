"use client";

import { Button } from "@heroui/react";
import ChipLegend from "../components/chipLegend";
import InfoItem from "../components/infoItem";

export default function Dashboard() {
  return (
    <main
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url('/images/background_dashboard.svg')` }}>
      <div className="absolute inset-0 bg-black/50 flex flex-col justify-between p-8">
        <div className="text-center text-white">
          <h1 className="text-title font-bold">APT 1-T1</h1>
          <p className="text-title font-">17/01/2025 20:29</p>
        </div>

        <div className="flex justify-between">
          <div className="space-y-4">
            <InfoItem label="Niveau" value="2" />
            <InfoItem label="Durée totale" value="00:29:56" />
            <InfoItem label="Pause" value="00:31:04" />
          </div>

          <div className="text-center text-white">
            <div className="text-[200px] font-bold">11:04</div>
            <div className="text-[120px]">50/100</div>
            <div className="text-[60px] opacity-80">100/150</div>
          </div>

          <div className="space-y-4 text-right">
            <InfoItem label="Stack moyen" value="2760" />
            <InfoItem label="Ante" value="-" />
            <InfoItem label="Joueurs" value="26/28" />
          </div>
        </div>

        <ChipLegend />
      </div>
    </main>
  );
}
