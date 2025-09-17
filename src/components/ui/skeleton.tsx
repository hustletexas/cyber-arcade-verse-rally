import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'cyber' | 'shimmer' | 'glow';
}

function Skeleton({
  className,
  variant = 'default',
  ...props
}: SkeletonProps) {
  const variants = {
    default: "animate-pulse bg-muted",
    cyber: "bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] border border-neon-cyan/20",
    shimmer: "bg-gradient-to-r from-muted via-neon-cyan/10 to-muted bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]",
    glow: "animate-pulse bg-muted border border-neon-pink/30 shadow-[0_0_15px_rgba(255,0,255,0.3)]"
  };

  return (
    <div
      className={cn("rounded-md", variants[variant], className)}
      {...props}
    />
  )
}

export { Skeleton }
