import React from "react";
import { Chip } from "@/app/types";

interface ChipLegendProps {
  chips: Chip[];
}

export const ChipLegend = React.memo<ChipLegendProps>(({ chips }) => {
  if (!chips || chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {chips.map((chip) => (
        <div
          key={chip.id}
          className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
          <img
            src={chip.chip_image}
            alt={`Chip ${chip.value}`}
            className="w-6 h-6 object-contain"
            loading="lazy"
            width={24}
            height={24}
          />
          <span className="text-white text-sm font-medium">
            {chip.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
});

ChipLegend.displayName = 'ChipLegend';
