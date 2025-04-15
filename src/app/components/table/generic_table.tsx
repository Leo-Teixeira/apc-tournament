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
  Spinner
} from "@heroui/react";
import {
  Delete02Icon,
  PencilEdit02Icon,
  ViewIcon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";
import { getKeyValue } from "@heroui/react";

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
  getDetailUrl?: (id: T["id"]) => string;
};

export function GenericTable<T extends { id: string | number }>({
  columns,
  items,
  ariaLabel,
  showActions = false,
  enableRowClick = false,
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
  }, [items, sortDescriptor]);

  return (
    <Table
      aria-label={ariaLabel}
      sortDescriptor={sortDescriptor}
      onSortChange={setSortDescriptor}
      isStriped>
      <TableHeader columns={visibleColumns}>
        {(column) => (
          <TableColumn
            key={String(column.uid)}
            align={column.align || "start"}
            allowsSorting={column.uid !== "action"}>
            {column.name}
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
            className={`${
              enableRowClick && getDetailUrl ? "hover:bg-green-600" : ""
            }`}>
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
              const content = col?.render
                ? col.render(value, item)
                : (value as React.ReactNode);

              if (enableRowClick && getDetailUrl) {
                return (
                  <TableCell>
                    <a
                      href={getDetailUrl(item.id)}
                      target="_blank"
                      rel="noopener noreferrer">
                      {content}
                    </a>
                  </TableCell>
                );
              }

              return <TableCell>{content}</TableCell>;
            }}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
