"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip
} from "@heroui/react";
import {
  Delete02Icon,
  PencilEdit02Icon,
  ViewIcon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";

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
};

export function GenericTable<T extends { id: string | number }>({
  columns,
  items,
  ariaLabel,
  showActions = false
}: GenericTableProps<T>) {
  const visibleColumns = showActions
    ? columns
    : columns.filter((col) => col.uid !== "action");

  return (
    <Table aria-label={ariaLabel} isStriped>
      <TableHeader columns={visibleColumns}>
        {(column) => (
          <TableColumn key={String(column.uid)} align={column.align || "start"}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>

      <TableBody items={items}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => {
              if (columnKey === "action") {
                return (
                  <TableCell>
                    <div className="relative flex items-center gap-2">
                      <Tooltip content="Details">
                        <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                          <HugeiconsIcon
                            icon={ViewIcon}
                            size={16}
                            color="currentColor"
                            strokeWidth={1.5}
                          />
                        </span>
                      </Tooltip>
                      <Tooltip content="Edit">
                        <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                          <HugeiconsIcon
                            icon={PencilEdit02Icon}
                            size={16}
                            color="currentColor"
                            strokeWidth={1.5}
                          />
                        </span>
                      </Tooltip>
                      <Tooltip color="danger" content="Delete">
                        <span className="text-lg text-danger cursor-pointer active:opacity-50">
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            size={16}
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

              return (
                <TableCell>
                  {col?.render
                    ? col.render(value, item)
                    : (value as React.ReactNode)}
                </TableCell>
              );
            }}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
