"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:rounded-md group-[.toast]:text-sm group-[.toast]:font-medium hover:group-[.toast]:bg-primary/90 transition-colors",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:rounded-md group-[.toast]:text-sm group-[.toast]:font-medium hover:group-[.toast]:bg-muted/80 transition-colors",
          success:
            "group-[.toaster]:!bg-green-500 group-[.toaster]:!text-white group-[.toaster]:border-green-600",
          error:
            "group-[.toaster]:!bg-red-500 group-[.toaster]:!text-white group-[.toaster]:border-red-600",
          info:
            "group-[.toaster]:!bg-blue-500 group-[.toaster]:!text-white group-[.toaster]:border-blue-600",
          warning:
            "group-[.toaster]:!bg-yellow-500 group-[.toaster]:!text-white group-[.toaster]:border-yellow-600",
        },
      }}
      duration={3500} // Default duration for toasts
      position="bottom-right" // Default position
      {...props}
    />
  )
}

export { Toaster }
