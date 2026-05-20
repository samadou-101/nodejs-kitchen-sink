import type { ReactNode } from "react"
import { Label } from "#components/components/ui/label"

interface FieldProps {
  label: string
  error?: string | null
  children: ReactNode
}

export function Field({ label, error, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
