import type { ReactNode } from "react"
import { Card, CardContent } from "#components/components/ui/card"
import { Skeleton } from "#components/components/ui/skeleton"

interface KpiCardProps {
  icon: ReactNode
  label: string
  value: number | undefined
  isLoading?: boolean
}

export function KpiCard({ icon, label, value, isLoading }: KpiCardProps) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-8 w-16" />
          ) : (
            <p className="text-3xl font-bold">{value ?? 0}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
