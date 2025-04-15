// components/Table/GenericTable.tsx

"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@heroui/react";
import React from "react";

export type Column<T> = {
  name: string;
  uid: keyof T;
  align?: "start" | "center" | "end";
  render?: (value: T[keyof T], item: T) => React.ReactNode;
};

export type GenericTableProps<T extends { id: string | number }> = {
  columns: Column<T>[];
  items: T[];
  ariaLabel: string;
};

export function GenericTable<T extends { id: string | number }>({
  columns,
  items,
  ariaLabel
}: GenericTableProps<T>) {
  return (
    <Table aria-label={ariaLabel} isStriped>
      <TableHeader columns={columns}>
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
