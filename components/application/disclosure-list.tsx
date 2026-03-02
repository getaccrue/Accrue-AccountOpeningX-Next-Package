"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { DisclosureItem } from "./disclosure-item"
import type { Disclosure, DisclosureAttestation } from "@/lib/salesforce/types"

interface DisclosureListProps {
  disclosures: Disclosure[]
  onStateChange: (state: {
    allRequiredAttested: boolean
    attestations: DisclosureAttestation[]
  }) => void
  initialAttestations?: DisclosureAttestation[]
}

export function DisclosureList({
  disclosures,
  onStateChange,
  initialAttestations = [],
}: DisclosureListProps) {
  const [attestedIds, setAttestedIds] = useState<Set<string>>(
    new Set(initialAttestations.map((a) => a.disclosureId))
  )

  const sortedDisclosures = useMemo(
    () => [...disclosures].sort((a, b) => a.sortOrder - b.sortOrder),
    [disclosures]
  )

  const requiredDisclosures = useMemo(
    () => sortedDisclosures.filter((d) => d.required),
    [sortedDisclosures]
  )

  const allRequiredAttested = useMemo(
    () => requiredDisclosures.every((d) => attestedIds.has(d.id)),
    [requiredDisclosures, attestedIds]
  )

  const buildAttestations = useCallback((): DisclosureAttestation[] => {
    return sortedDisclosures
      .filter((d) => attestedIds.has(d.id))
      .map((d) => ({
        disclosureId: d.id,
        title: d.title,
        attestedAt: new Date().toISOString(),
        pdfUrl: d.pdfUrl,
      }))
  }, [sortedDisclosures, attestedIds])

  useEffect(() => {
    onStateChange({
      allRequiredAttested,
      attestations: buildAttestations(),
    })
  }, [allRequiredAttested, buildAttestations, onStateChange])

  const handleAttestedChange = (disclosureId: string, checked: boolean) => {
    setAttestedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(disclosureId)
      } else {
        next.delete(disclosureId)
      }
      return next
    })
  }

  const attestedCount = attestedIds.size
  const totalCount = sortedDisclosures.length
  const requiredCount = requiredDisclosures.length
  const requiredAttestedCount = requiredDisclosures.filter((d) =>
    attestedIds.has(d.id)
  ).length

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {attestedCount} of {totalCount} acknowledged
        </span>
        <span>
          {requiredAttestedCount} of {requiredCount} required completed
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {sortedDisclosures.map((disclosure) => (
          <DisclosureItem
            key={disclosure.id}
            disclosure={disclosure}
            isAttested={attestedIds.has(disclosure.id)}
            onAttestedChange={(checked) =>
              handleAttestedChange(disclosure.id, checked)
            }
          />
        ))}
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-xs text-muted-foreground">
          {"By checking each box above, I acknowledge that I have received, read, and agree to the terms of each disclosure document. I understand that checking the box constitutes my electronic signature for each document."}
        </p>
      </div>

      {!allRequiredAttested && attestedCount > 0 && (
        <p className="text-sm text-destructive">
          Please acknowledge all required disclosures to continue.
        </p>
      )}
    </div>
  )
}
