"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { useApplication } from "@/lib/application-context"
import { DisclosureList } from "@/components/application/disclosure-list"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, ArrowRight, RefreshCw, AlertCircle } from "lucide-react"
import type { Disclosure, DisclosureAttestation } from "@/lib/salesforce/types"

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch disclosures")
    return res.json() as Promise<Disclosure[]>
  })

function DisclosureSkeletonItem() {
  return (
    <div className="flex items-start gap-4 rounded-lg border bg-card p-4">
      <Skeleton className="mt-1 h-5 w-5 shrink-0 rounded" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}

export default function DisclosuresPage() {
  const router = useRouter()
  const {
    selectedProduct,
    setCurrentStep,
    setDisclosureAttestations,
    disclosureAttestations,
  } = useApplication()
  const [allReady, setAllReady] = useState(false)
  const pendingAttestations = useRef<DisclosureAttestation[]>([])

  const productId = selectedProduct?.id
  const {
    data: disclosures,
    error,
    isLoading,
    mutate,
  } = useSWR<Disclosure[]>(
    productId ? `/api/salesforce/products/${productId}/disclosures` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    setCurrentStep("disclosures")
  }, [setCurrentStep])

  const sortedDisclosures = disclosures
    ? [...disclosures].sort((a, b) => a.sortOrder - b.sortOrder)
    : []

  const handleStateChange = useCallback(
    (state: {
      allRequiredAttested: boolean
      attestations: DisclosureAttestation[]
    }) => {
      setAllReady(state.allRequiredAttested)
      pendingAttestations.current = state.attestations
    },
    []
  )

  const handleContinue = () => {
    if (!allReady) return
    setDisclosureAttestations(pendingAttestations.current)
    router.push("/apply/funding")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Disclosures & Agreements
        </h1>
        <p className="mt-1 text-muted-foreground">
          Please review and acknowledge the following disclosures for your{" "}
          <span className="font-medium text-foreground">
            {selectedProduct?.name ?? "your"}
          </span>{" "}
          account. Click each document link to review, then check the box to
          confirm.
        </p>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div>
            <p className="font-medium text-foreground">
              Unable to load disclosures
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              There was a problem fetching required disclosures. Please try
              again.
            </p>
          </div>
          <Button variant="outline" onClick={() => mutate()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <DisclosureSkeletonItem key={i} />
          ))}
        </div>
      ) : (
        <DisclosureList
          disclosures={sortedDisclosures}
          onStateChange={handleStateChange}
          initialAttestations={disclosureAttestations}
        />
      )}

      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => router.push("/apply/kyc")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          size="lg"
          disabled={!allReady || isLoading || !!error}
          onClick={handleContinue}
          className="gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
