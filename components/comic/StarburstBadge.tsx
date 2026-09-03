import React from "react";
import { cn } from "@/lib/utils";

interface StarburstBadgeProps {
  children: React.ReactNode;
  className?: string;
  bgColor?: string;
  textColor?: string;
  size?: "sm" | "md" | "lg";
  rotate?: string;
}

export const StarburstBadge: React.FC<StarburstBadgeProps> = ({
  children,
  className,
  bgColor = "#FFE600",
  textColor = "#0A0A0C",
  size = "md",
  rotate = "-4deg",
}) => {
  const sizeClasses = {
    sm: "w-20 h-20 text-xs",
    md: "w-28 h-28 text-sm",
    lg: "w-36 h-36 text-base",
  };

  return (
    <div
      className={cn(
        "comic-starburst drop-shadow-[3px_3px_0px_#0A0A0C] font-black uppercase tracking-wider p-2 flex flex-col items-center justify-center transition-transform hover:scale-110",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        transform: `rotate(${rotate})`,
      }}
    >
      <span className="leading-none text-center">{children}</span>
    </div>
  );
};
