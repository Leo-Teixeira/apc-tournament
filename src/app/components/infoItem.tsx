"use client";

import { ReactNode } from "react";

type InfoItemProps = {
  label: string;
  value: ReactNode;
};

export default function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="text-white text-center">
      <div className="text-h1 font-bold">{label}</div>
      <div className="text-h1 font-bold">{value}</div>
    </div>
  );
}
