import "./Button.css";

import clsx from "clsx";
import { ButtonHTMLAttributes, ForwardedRef, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const ButtonImpl = ({
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  ...props
}: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) => (
  <button
    ref={ref}
    type={type}
    className={clsx(
      "ui-button",
      `ui-button--${variant}`,
      `ui-button--${size}`,
      {
        "ui-button--full": fullWidth,
      },
      className,
    )}
    {...props}
  />
);

const Button = forwardRef(ButtonImpl);

export default Button;

