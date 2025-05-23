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
      className={`flex items-center justify-center gap-gap-6 rounded-xl cursor-pointer transition-all duration-200 ${
        iconOnly ? "p-2" : "px-3 py-2 sm:px-4 sm:py-2"
      } ${buttonClassName}`}>
      {!iconOnly && text && (
        <span
          className={`text-xs sm:text-s md:text-l font-satoshiRegular ${textClassName}`}>
          {text}
        </span>
      )}
      {icon}
    </Button>
  );
};
