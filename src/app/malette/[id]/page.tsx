"use client";

import { Chip, Stack } from "@/app/types";
import { Button, Card, Divider } from "@heroui/react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ButtonComponents } from "@/app/components/button";
import { useParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";

export default function StackPage() {
  const { id } = useParams();
  const [stack, setStack] = useState<Stack>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stackRes = await fetch(`/api/stack/${id}`);
        const data = await stackRes.json();
        setStack(data);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row justify-between">
        <p className="font-satoshiBlack text-4xl text-primary_brand-50">
          Stacks
        </p>
        <ButtonComponents
          text="Nouveau jeton"
          buttonClassName="bg-primary_brand-500"
          textClassName="text-primary_brand-50"
        />
      </div>

      <div className="flex flex-row gap-6">
        {stack?.chips.map((chip) => (
          <Card className="flex flex-col items-center p-4 gap-2 bg-background_card rounded-2xl">
            <img
              className="rounded-lg"
              src={(chip as Chip).chip_image}
              alt="jeton"
            />
            <p className="text-neutral-50 font-satoshi text-l">
              {(chip as Chip).value}
            </p>
            <span
              onClick={() => {}}
              className={`text-lg px-3xs rounded-xl cursor-pointer active:opacity-50 text-neutral-50`}>
              <HugeiconsIcon icon={Delete02Icon} size={20} strokeWidth={1.5} />
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
