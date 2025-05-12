import { Chip } from "./chip.types";

export type Stack = {
  id: number;
  stack_name: string;
  stack_chip: number;
  chip?: Chip;
};
