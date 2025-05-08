import {
  DatePicker,
  DateValue,
  Input,
  NumberInput,
  TimeInput
} from "@heroui/react";

type NumberInputProps = {
  label?: string;
  type: string;
  numberInputClassName?: string;
  value: number;
  onChange: (e?: any) => void;
};

export const NumberInputComponents: React.FC<NumberInputProps> = ({
  label,
  numberInputClassName,
  value,
  onChange
}) => {
  return (
    <div className="flex flex-col gap-3">
      {label ? (
        <span className="text-l font-satoshiMedium text-primary_brand-50">
          {label}
        </span>
      ) : (
        <></>
      )}
      <NumberInput value={value} />
    </div>
  );
};
