import { useState } from "react"
import { cn } from "#components/lib/utils"

type AspectRatio = "1:1" | "4:3" | "16:9"
type Size = "sm" | "md" | "lg"

interface ProductImageProps {
  src?: string | null
  alt: string
  aspect?: AspectRatio
  size?: Size
  className?: string
}

const aspectClasses: Record<AspectRatio, string> = {
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
  "16:9": "aspect-video",
}

const sizeClasses: Record<Size, string> = {
  sm: "w-12 h-12",
  md: "w-full",
  lg: "w-full",
}

export function ProductImage({
  src,
  alt,
  aspect = "4:3",
  size = "md",
  className,
}: ProductImageProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        aspectClasses[aspect],
        sizeClasses[size],
        className
      )}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
          <svg
            className="h-8 w-8 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
