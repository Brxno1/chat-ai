import { CheckIcon, CopyIcon } from "lucide-react";
import React from "react";

import { clipboardWriteText } from "@/utils/clipboard-write-text";
import { cn } from "@/utils/utils";

function CopyIconComponent({ hasCopied, iconSize = 16 }: { hasCopied: boolean, iconSize?: number }) {
  return (
    <div className="relative flex items-center">
      <div
        className={cn("scale-100 opacity-100 transition-all", {
          "translate-x-1 scale-0 opacity-0": hasCopied,
        })}
      >
        <CopyIcon aria-hidden="true" size={iconSize} />
      </div>
      <div
        className={cn("absolute right-0 scale-0 opacity-0 transition-all", {
          "scale-100 opacity-100": hasCopied,
        })}
      >
        <CheckIcon
          className="stroke-emerald-500"
          aria-hidden="true"
          size={iconSize}
        />
      </div>
    </div>
  );
}

interface CopyTextComponentProps {
  className?: string;
  children?: React.ReactNode;
  textForCopy: string;
  iconPosition?: "left" | "right";
  onCloseComponent?: () => void;
  iconSize?: number;
}

function CopyTextComponent({
  className,
  children,
  textForCopy,
  iconPosition = "right",
  onCloseComponent,
  iconSize = 16,
}: CopyTextComponentProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  async function handleCopy(ev: React.MouseEvent<HTMLDivElement>) {
    ev.preventDefault();

    await clipboardWriteText(textForCopy);
    setHasCopied(true);
    setTimeout(() => {
      setHasCopied(false);
      onCloseComponent?.();
    }, 800);
  }

  return (
    <div
      className={cn("flex w-full items-center", className)}
      onClick={handleCopy}
    >
      {iconPosition === "left" && <CopyIconComponent hasCopied={hasCopied} iconSize={iconSize} />}
      {children}
      {iconPosition === "right" && <CopyIconComponent hasCopied={hasCopied} iconSize={iconSize} />}
    </div>
  );
}

export { CopyTextComponent, CopyIconComponent };
