// components/Table/table.types.ts

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
  enableDrag?: boolean;
  onReorder?: (newItems: T[]) => void;
};
