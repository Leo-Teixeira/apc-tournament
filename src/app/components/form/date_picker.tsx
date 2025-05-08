import { DatePicker, DateValue, Input } from "@heroui/react";

type DatePickerProps = {
  label?: string;
  type: string;
  DatePickerClassName?: string;
  value: DateValue | null;
  onChange: (e?: any) => void;
};

export const DatePickerComponents: React.FC<DatePickerProps> = ({
  label,
  DatePickerClassName,
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
      <DatePicker granularity="second" value={value} onChange={onChange} />
    </div>
  );
};
