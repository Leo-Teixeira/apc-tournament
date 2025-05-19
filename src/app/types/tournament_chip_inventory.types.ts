import { Chip } from "./chip.types";
import { Stack } from "./stack.types";

export type StackChip = {
  stack_id: number;
  chip_id: number;
  chip?: Chip;
  stack?: Stack;
};
