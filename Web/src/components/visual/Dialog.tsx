import "./Dialog.css";

import clsx from "clsx";
import { MouseEvent, ReactNode } from "react";

type DialogAlignment = "center" | "top";
type DialogSize = "sm" | "md" | "lg" | "full";

export interface DialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  children: ReactNode;
  labelledBy?: string;
  describedBy?: string;
  align?: DialogAlignment;
  size?: DialogSize;
  contentClassName?: string;
  closeOnBackdrop?: boolean;
}

const resolveOpenState = (open?: boolean, isOpen?: boolean) => {
  if (typeof open === "boolean") return open;
  if (typeof isOpen === "boolean") return isOpen;
  return false;
};

const Dialog = ({
  isOpen,
  open,
  onClose,
  children,
  labelledBy,
  describedBy,
  align = "center",
  size = "md",
  contentClassName,
  closeOnBackdrop = true,
}: DialogProps) => {
  const visible = resolveOpenState(open, isOpen);

  if (!visible) return null;

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdrop || !onClose) return;
    if (event.target !== event.currentTarget) return;
    onClose();
  };

  return (
    <div
      className={clsx("ui-dialog", `ui-dialog--${align}`)}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onMouseDown={handleBackdropClick}
    >
      <div className="ui-dialog__backdrop" />
      <div
        className={clsx(
          "ui-dialog__content",
          `ui-dialog__content--${size}`,
          contentClassName,
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Dialog;

interface SectionProps {
  className?: string;
  children: ReactNode;
}

export const DialogHeader = ({ className, children }: SectionProps) => (
  <header className={clsx("ui-dialog__header", className)}>{children}</header>
);

interface TitleProps {
  id?: string;
  className?: string;
  children: ReactNode;
}

export const DialogTitle = ({ id, className, children }: TitleProps) => (
  <h2 id={id} className={clsx("ui-dialog__title", className)}>
    {children}
  </h2>
);

export const DialogDescription = ({
  id,
  className,
  children,
}: TitleProps) => (
  <p id={id} className={clsx("ui-dialog__description", className)}>
    {children}
  </p>
);

interface BodyProps extends SectionProps {
  scrollable?: boolean;
}

export const DialogBody = ({
  className,
  scrollable = false,
  children,
}: BodyProps) => (
  <div
    className={clsx(
      "ui-dialog__body",
      { "ui-dialog__body--scroll": scrollable },
      className,
    )}
  >
    {children}
  </div>
);

interface ActionsProps extends SectionProps {
  align?: "start" | "center" | "end" | "space-between";
  stacked?: boolean;
}

export const DialogFooter = ({
  className,
  children,
  align = "end",
  stacked = false,
}: ActionsProps) => (
  <div
    className={clsx(
      "ui-dialog__actions",
      `ui-dialog__actions--${align}`,
      {
        "ui-dialog__actions--stack": stacked,
      },
      className,
    )}
  >
    {children}
  </div>
);

