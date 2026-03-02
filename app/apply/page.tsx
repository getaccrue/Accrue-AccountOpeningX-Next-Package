"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { useApplication } from "@/lib/application-context"
import { ProductCard } from "@/components/application/product-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, RefreshCw, AlertCircle } from "lucide-react"
import type { DepositProduct } from "@/lib/salesforce/types"

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch products")
    return res.json() as Promise<DepositProduct[]>
  })

function ProductSkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-3 pb-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-36" />
        </div>
      </div>
      <div className="flex flex-col gap-4 pt-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-40" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-48" />
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3.5 w-44" />
        </div>
        <Skeleton className="mt-2 h-10 w-full" />
      </div>
    </div>
  )
}

export default function ProductSelectionPage() {
  const router = useRouter()
  const {
    selectedProduct,
    setSelectedProduct,
    setApplicationId,
    setCurrentStep,
  } = useApplication()

  const {
    data: products,
    error,
    isLoading,
    mutate,
  } = useSWR<DepositProduct[]>("/api/salesforce/products", fetcher, {
    revalidateOnFocus: false,
  })

  useEffect(() => {
    setCurrentStep("product")
  }, [setCurrentStep])

  const handleContinue = () => {
    if (!selectedProduct) return
    setApplicationId(`APP-${Date.now().toString(36).toUpperCase()}`)
    router.push("/apply/personal")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Choose Your Account
        </h1>
        <p className="mt-1 text-muted-foreground">
          Select the deposit product that best fits your financial needs.
        </p>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div>
            <p className="font-medium text-foreground">
              Unable to load products
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              There was a problem fetching account options. Please try again.
            </p>
          </div>
          <Button variant="outline" onClick={() => mutate()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductSkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {products?.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={selectedProduct?.id === product.id}
              onSelect={setSelectedProduct}
            />
          ))}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button
          size="lg"
          disabled={!selectedProduct || isLoading || !!error}
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
