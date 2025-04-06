"use client";

const chipValues = [25, 50, 100, 500, 1000];

export default function ChipLegend() {
  return (
    <div className="flex justify-center gap-32 mt-4">
      {chipValues.map((value) => (
        <div key={value} className="flex flex-col items-center">
          <div className="w-36 h-36 rounded-full bg-green-800" />
          <span className="text-white text-h1 font-bold mt-1">{value}</span>
        </div>
      ))}
    </div>
  );
}
