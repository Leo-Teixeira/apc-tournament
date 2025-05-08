"use client";

const chipValues = [25, 50, 100, 500, 1000];

export default function ChipLegend() {
  return (
    <div className="flex justify-center gap-32 mt-4">
      {chipValues.map((value) => (
        <div key={value} className="flex flex-col items-center">
          <img
            src="/images/ellipseAvatar.png"
            alt={`Jeton test`}
            className="w-36 h-36"
          />
          <span className="text-primary_brand-50 text-xl4 font-satoshiBlack mt-1">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
