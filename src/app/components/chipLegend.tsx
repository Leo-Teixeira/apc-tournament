"use client";

import { Chip } from "../types";

type ChipLegendProps = {
  chips: Chip[];
};

export const ChipLegend: React.FC<ChipLegendProps> = ({ chips }) => {
  if (!Array.isArray(chips)) return null;

  return (
    <div className="flex justify-center gap-32 mt-4">
      {chips.map((chip) => (
        <div key={chip.id} className="flex flex-col items-center">
          <img src={chip.chip_image} alt={`Jeton test`} className="w-32 h-32" />
          <span className="text-primary_brand-50 text-xl4 font-satoshiBlack mt-1">
            {chip.value}
          </span>
        </div>
      ))}
    </div>
  );
};
