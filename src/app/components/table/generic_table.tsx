"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  SortDescriptor,
  Spinner,
  Chip
} from "@heroui/react";
import {
  Delete02Icon,
  PencilEdit02Icon,
  ViewIcon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";
import { getKeyValue } from "@heroui/react";
import { STRINGS } from "@/app/constants/string";

export type Column<T> = {
  name: string;
  uid: keyof T | "action";
  align?: "start" | "center" | "end";
  render?: (value: T[keyof T], item: T) => React.ReactNode;
};

export type GenericTableProps<T extends { id: string | number }> = {
  columns: Column<T>[];
  items: T[];
  ariaLabel: string;
  showActions?: boolean;
  enableRowClick?: boolean;
  enableSorting?: boolean;
  getDetailUrl?: (id: T["id"]) => string;
};

export function GenericTable<T extends { id: string | number }>({
  columns,
  items,
  ariaLabel,
  showActions = false,
  enableRowClick = false,
  enableSorting = true,
  getDetailUrl
}: GenericTableProps<T>) {
  const visibleColumns = showActions
    ? columns
    : columns.filter((col) => col.uid !== "action");

  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: String(columns[0]?.uid || "id"),
    direction: "ascending"
  });

  const sortedItems = React.useMemo(() => {
    if (!enableSorting) return items;

    const { column, direction } = sortDescriptor;

    if (!column || column === "action") return items;

    const sorted = [...items].sort((a, b) => {
      const aVal = getKeyValue(a, column);
      const bVal = getKeyValue(b, column);

      const aParsed = typeof aVal === "string" ? aVal.toLowerCase() : aVal;
      const bParsed = typeof bVal === "string" ? bVal.toLowerCase() : bVal;

      if (aParsed < bParsed) return direction === "ascending" ? -1 : 1;
      if (aParsed > bParsed) return direction === "ascending" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [items, sortDescriptor, enableSorting]);

  return (
    <Table
      aria-label={ariaLabel}
      sortDescriptor={enableSorting ? sortDescriptor : undefined}
      onSortChange={enableSorting ? setSortDescriptor : undefined}>
      <TableHeader columns={visibleColumns}>
        {(column) => (
          <TableColumn
            className="text-s font-satoshiMedium text-neutral-300"
            key={String(column.uid)}
            align={column.align || "start"}
            allowsSorting={enableSorting && column.uid !== "action"}>
            {column.name.toUpperCase()}
          </TableColumn>
        )}
      </TableHeader>

      <TableBody
        items={sortedItems}
        isLoading={false}
        loadingContent={<Spinner label="Chargement..." />}>
        {(item) => (
          <TableRow
            key={item.id}
            onClick={() => {
              if (enableRowClick && getDetailUrl) {
                window.open(getDetailUrl(item.id), "_self");
              }
            }}
            className={`${
              enableRowClick && getDetailUrl
                ? "hover:bg-white/10 hover:rounded-full cursor-pointer rounded-full"
                : "rounded-full"
            }`}>
            {(columnKey) => {
              if (columnKey === "action") {
                return (
                  <TableCell>
                    <div className="relative flex items-center gap-2">
                      <Tooltip content="Details" className="px-3xs">
                        <span className="text-lg px-3xs rounded-xl text-white cursor-pointer active:opacity-50">
                          <HugeiconsIcon
                            icon={ViewIcon}
                            size={20}
                            color="currentColor"
                            strokeWidth={1.5}
                          />
                        </span>
                      </Tooltip>
                      <Tooltip content="Edit" className="px-3xs">
                        <span className="text-lg px-3xs rounded-xl text-white cursor-pointer active:opacity-50">
                          <HugeiconsIcon
                            icon={PencilEdit02Icon}
                            size={20}
                            color="currentColor"
                            strokeWidth={1.5}
                          />
                        </span>
                      </Tooltip>
                      <Tooltip
                        color="danger"
                        content="Delete"
                        className="px-3xs">
                        <span className="text-lg text-danger-500 px-3xs rounded-xl text-danger cursor-pointer active:opacity-50">
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            size={20}
                            color="currentColor"
                            strokeWidth={1.5}
                          />
                        </span>
                      </Tooltip>
                    </div>
                  </TableCell>
                );
              }

              const col = columns.find((c) => c.uid === columnKey);
              const value = item[columnKey as keyof T];
              const content = col?.render
                ? col.render(value, item)
                : (value as React.ReactNode);

              if (columnKey === "status") {
                return (
                  <TableCell>
                    <Chip
                      className={`capitalize py-0 px-1 items-center justify-center text-white font-satoshi text-l font-normal ${
                        value === "finish"
                          ? "bg-red-950"
                          : value === "in_coming"
                          ? "bg-purple-950"
                          : "bg-green-950"
                      }`}
                      size="sm"
                      variant="flat">
                      {content == "finish"
                        ? STRINGS.status.finish
                        : content == "in_coming"
                        ? STRINGS.status.in_coming
                        : STRINGS.status.start}
                    </Chip>
                  </TableCell>
                );
              }

              return (
                <TableCell className="font-satoshiMedium text-l leading-7">
                  {content}
                </TableCell>
              );
            }}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
