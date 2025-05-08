"use client";

import { ReactNode } from "react";

type InfoItemProps = {
  label: string;
  value: ReactNode;
};

export default function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="text-primary_brand-50 text-center">
      <div className="text-4xl font-satoshiBold">{label}</div>
      <div className="text-6xl font-satoshiBold">{value}</div>
    </div>
  );
}
