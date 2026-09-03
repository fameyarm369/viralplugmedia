import React from "react";
import { cn } from "@/lib/utils";

interface ComicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "yellow" | "pink" | "cyan" | "white" | "dark";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const ComicButton: React.FC<ComicButtonProps> = ({
  children,
  variant = "yellow",
  size = "md",
  icon,
  fullWidth = false,
  className,
  ...props
}) => {
  const variantStyles = {
    yellow: "comic-btn-yellow",
    pink: "comic-btn-pink",
    cyan: "comic-btn-cyan",
    white: "comic-btn-white",
    dark: "bg-comic-black text-white border-white hover:bg-neutral-900",
  };

  const sizeStyles = {
    sm: "text-sm py-2 px-4",
    md: "text-base py-3 px-6",
    lg: "text-lg py-4 px-8",
  };

  return (
    <button
      className={cn(
        "comic-btn",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {icon && <span className="mr-2 inline-flex items-center">{icon}</span>}
      {children}
    </button>
  );
};
