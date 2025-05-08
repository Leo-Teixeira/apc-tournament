"use client";

import ChipLegend from "@/app/components/chipLegend";
import InfoItem from "@/app/components/infoItem";

export default function Game() {
  return (
    <main
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url('/images/background_dashboard.svg')` }}>
      <div className="absolute inset-0 bg-black/50 flex flex-col justify-between p-8">
        <div className="text-center text-white">
          <h1 className="text-7xl font-satoshiBold text-primary_brand-50">
            APT 1-T1
          </h1>
          <p className="font-satoshi text-5xl text-primary_brand-50">
            17/01/2025 20:29
          </p>
        </div>

        <div className="flex justify-between">
          <div className="space-y-4">
            <InfoItem label="Niveau" value="2" />
            <InfoItem label="Durée totale" value="00:29:56" />
            <InfoItem label="Pause" value="00:31:04" />
          </div>

          <div className="text-center text-primary_brand-50">
            <div className="text-xl12 font-satoshiBold">11:04</div>
            <div className="text-xl7 font-satoshiBold">50/100</div>
            <div className="text-xl6 font-satoshiBold">100/150</div>
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
