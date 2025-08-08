import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface HeaderLogoProps {
  showTitle?: boolean
  className?: string
}

const HeaderLogo = ({ showTitle = true, className }: HeaderLogoProps) => {
  return (
    <Link href="/" className="flex items-center gap-x-2">
      <Image
        src="/logo.svg"
        alt="Federal Invest Logo"
        height={32}
        width={32}
        className={cn("drop-shadow-md", className)}
      />
      {showTitle && (
        <span className="font-bold text-xl">Federal Invest</span>
      )}
    </Link>
  )
}

export default HeaderLogo