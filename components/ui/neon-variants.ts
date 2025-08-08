// Neon design system variants
export const neonVariants = {
  button: {
    neon: "bg-black/80 text-white border border-blue-500/50 hover:bg-blue-900/20 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300",
    neonGhost: "text-blue-400 hover:text-white hover:bg-blue-900/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]",
    neonOutline: "border border-blue-500/50 text-blue-400 hover:bg-blue-900/20 hover:text-white hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]",
    neonDestructive: "bg-black/80 text-red-400 border border-red-500/50 hover:bg-red-900/20 hover:border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]",
  },
  input: {
    neon: "bg-black/50 border-blue-500/30 text-white placeholder:text-gray-400 focus:border-blue-400 focus:bg-black/70 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300",
  },
  select: {
    neon: "bg-black/50 border-blue-500/30 text-white focus:border-blue-400 focus:bg-black/70 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 data-[placeholder]:text-gray-400",
    neonContent: "bg-black/90 border-blue-500/50 text-white",
    neonItem: "text-gray-300 focus:bg-blue-900/30 focus:text-white data-[disabled]:text-gray-600",
  },
  card: {
    neon: "bg-black/80 border-blue-500/20 text-white hover:border-blue-400/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-300",
  },
  badge: {
    neon: "bg-blue-900/30 text-blue-400 border border-blue-500/50",
    neonSuccess: "bg-green-900/30 text-green-400 border border-green-500/50",
    neonWarning: "bg-yellow-900/30 text-yellow-400 border border-yellow-500/50",
    neonDanger: "bg-red-900/30 text-red-400 border border-red-500/50",
  },
  dialog: {
    neonOverlay: "bg-black/80 backdrop-blur-sm",
    neonContent: "bg-black/90 border border-blue-500/50 text-white",
  },
  dropdown: {
    neonContent: "bg-black/90 border-blue-500/50 text-white",
    neonItem: "text-gray-300 focus:bg-blue-900/30 focus:text-white data-[disabled]:text-gray-600",
  },
  tooltip: {
    neon: "bg-black/90 text-white border border-blue-500/50",
  },
  sheet: {
    neonOverlay: "bg-black/80 backdrop-blur-sm",
    neonContent: "bg-black/90 border-l border-blue-500/50 text-white",
  },
  table: {
    neon: "border-blue-500/20",
    neonHeader: "bg-black/50 border-b border-blue-500/30",
    neonRow: "border-b border-blue-500/10 hover:bg-blue-900/10 data-[state=selected]:bg-blue-900/20",
    neonCell: "text-gray-300",
  },
  progress: {
    neon: "bg-black/50 border border-blue-500/30",
    neonIndicator: "bg-gradient-to-r from-blue-600 to-blue-400",
  },
  form: {
    neonLabel: "text-gray-300",
    neonDescription: "text-gray-400",
    neonError: "text-red-400",
  },
  skeleton: {
    neon: "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 animate-shimmer",
  },
}

// Export utility function to get neon class names
export const getNeonClass = (component: keyof typeof neonVariants, variant: string) => {
  const componentVariants = neonVariants[component] as Record<string, string>
  return componentVariants[variant] || ""
} 