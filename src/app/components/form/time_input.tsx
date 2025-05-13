import { DatePicker, DateValue, Input, TimeInput } from "@heroui/react";

type TimeInputProps = {
  label?: string;
  type: string;
  timeInputClassName?: string;
  value: any;
  onChange: (e?: any) => void;
};

export const TimeInputComponents: React.FC<TimeInputProps> = ({
  label,
  timeInputClassName,
  value,
  onChange
}) => {
  return (
    <div className="flex flex-col gap-3">
      {label ? (
        <span className="text-l font-satoshiRegular text-primary_brand-50">
          {label}
        </span>
      ) : (
        <></>
      )}
      <TimeInput value={value} />
    </div>
  );
};
