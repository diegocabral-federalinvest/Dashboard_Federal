"use client";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { MouseEventHandler, memo } from "react";

interface NavButtonProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined;
  disabled?: boolean;
  showLockIcon?: boolean;
  activeClassName?: string;
  activeIconClassName?: string;
}

const NavButton = memo(({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
  disabled,
  showLockIcon,
  activeClassName = "bg-white text-blue-800",
  activeIconClassName = "text-blue-800"
}: NavButtonProps) => {
  const buttonClassName = cn(
    "h-[38px] px-4 rounded-full flex items-center gap-x-2 text-sm font-medium transition-all duration-300",
    isActive 
      ? activeClassName 
      : "text-white/80 hover:text-white hover:bg-white/10",
    disabled && "opacity-50"
  );

  const iconClassName = cn(
    "h-4 w-4",
    isActive 
      ? activeIconClassName 
      : "text-white/70 group-hover:text-white"
  );

  return (
    <Link
      href={href}
      onClick={onClick}
      className={buttonClassName}
      aria-disabled={disabled}
    >
      <Icon className={iconClassName} />
      {label}
    </Link>
  );
});

NavButton.displayName = "NavButton";

export default NavButton;