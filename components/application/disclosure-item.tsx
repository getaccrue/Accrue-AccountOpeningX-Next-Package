"use client"

import { ExternalLink } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { Disclosure } from "@/lib/salesforce/types"

interface DisclosureItemProps {
  disclosure: Disclosure
  isAttested: boolean
  onAttestedChange: (checked: boolean) => void
}

export function DisclosureItem({
  disclosure,
  isAttested,
  onAttestedChange,
}: DisclosureItemProps) {
  return (
    <div
      className={`rounded-lg border p-5 transition-colors ${
        isAttested
          ? "border-success/40 bg-success/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex gap-4">
        <div className="pt-0.5">
          <Checkbox
            id={`disclosure-${disclosure.id}`}
            checked={isAttested}
            onCheckedChange={(checked) =>
              onAttestedChange(checked === true)
            }
            aria-label={`I have read and agree to ${disclosure.title}`}
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor={`disclosure-${disclosure.id}`}
              className="cursor-pointer text-sm font-semibold text-foreground"
            >
              {disclosure.title}
            </label>
            {disclosure.required && (
              <Badge variant="secondary" className="text-xs">
                Required
              </Badge>
            )}
            {disclosure.scope === "bank" && (
              <Badge variant="outline" className="text-xs">
                General
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {disclosure.description}
          </p>
          <a
            href={disclosure.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Document (PDF)
          </a>
        </div>
      </div>
    </div>
  )
}
