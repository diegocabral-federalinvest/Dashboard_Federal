"use client"

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";

const spinnerVariants = cva(
  "relative inline-block text-primary",
  {
    variants: {
      variant: {
        default: "",
        primary: "text-primary",
        secondary: "text-secondary",
        accent: "text-blue-500",
        destructive: "text-destructive",
        muted: "text-muted-foreground"
      },
      size: {
        xs: "w-3 h-3",
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12"
      },
      animation: {
        spin: "",
        pulse: "",
        bounce: ""
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      animation: "spin"
    }
  }
);

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  label?: string;
}

export function Spinner({
  variant,
  size,
  animation,
  className,
  label = "Loading...",
  ...props
}: SpinnerProps) {
  // Different spinner animations based on the animation prop
  const renderSpinner = () => {
    switch (animation) {
      case "pulse":
        return (
          <motion.div
            className={cn(
              "rounded-full",
              spinnerVariants({ variant, size, animation, className })
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.6, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: [0.42, 0, 0.58, 1]
            }}
            {...props}
          />
        );
      case "bounce":
        return (
          <div className="flex items-center space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  "rounded-full",
                  spinnerVariants({ variant, size, animation: undefined, className: "" })
                )}
                animate={{
                  y: ["0%", "-50%", "0%"]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: [0.42, 0, 0.58, 1],
                  delay: i * 0.1
                }}
                {...props}
              />
            ))}
          </div>
        );
      case "spin":
      default:
        return (
          <svg
            className={cn(
              "animate-spin",
              spinnerVariants({ variant, size, animation, className })
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            {...props}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="flex items-center justify-center">
      {renderSpinner()}
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}

// Specialized spinner with a glass effect overlay for loading states
export function OverlaySpinner({
  variant = "primary",
  size = "lg",
  animation = "spin",
  message = "Carregando...",
  className,
  ...props
}: SpinnerProps & { message?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center",
        "bg-white/60 dark:bg-black/60 backdrop-blur-sm z-50",
        className
      )}
      {...props}
    >
      <Spinner variant={variant} size={size} animation={animation} />
      {message && (
        <p className="mt-4 text-sm font-medium text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

// Spinner with a card-like container
export function CardSpinner({
  variant = "primary",
  size = "md",
  animation = "spin",
  message = "Carregando dados...",
  className,
  ...props
}: SpinnerProps & { message?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-lg",
        "bg-background/50 backdrop-blur-sm border shadow-sm",
        className
      )}
      {...props}
    >
      <Spinner variant={variant} size={size} animation={animation} />
      {message && (
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
} 