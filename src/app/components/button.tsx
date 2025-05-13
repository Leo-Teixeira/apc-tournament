import { Button } from "@heroui/react";
import React from "react";

type ButtonProps = {
  text?: string;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  onClick?: () => void;
  buttonClassName?: string;
  textClassName?: string;
  disabled?: boolean;
};

export const ButtonComponents: React.FC<ButtonProps> = ({
  text,
  icon,
  iconOnly = false,
  onClick,
  buttonClassName = "",
  textClassName = "",
  disabled = false
}) => {
  return (
    <Button
      onPress={onClick}
      radius="lg"
      variant="light"
      isIconOnly={iconOnly}
      disabled={disabled}
      className={`flex  cursor-pointer justify-center items-center rounded-xl gap-gap-6 ${
        iconOnly ? "p-2" : "px-4 py-2"
      } ${buttonClassName}`}>
      {!iconOnly && text && (
        <span
          className={`text-s md:text-l leading-5 md:leading-7 font-satoshiRegular ${textClassName}`}>
          {text}
        </span>
      )}
      {icon}
    </Button>
  );
};
