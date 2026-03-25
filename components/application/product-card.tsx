"use client"

import type { DepositProduct } from "@/lib/salesforce/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Wallet, PiggyBank, TrendingUp, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const productTypeConfig: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  checking: {
    icon: Wallet,
    label: "Checking",
  },
  savings: {
    icon: PiggyBank,
    label: "Savings",
  },
  money_market: {
    icon: TrendingUp,
    label: "Money Market",
  },
  cd: {
    icon: Clock,
    label: "Certificate of Deposit",
  },
}

interface ProductCardProps {
  product: DepositProduct
  isSelected: boolean
  onSelect: (product: DepositProduct) => void
}

export function ProductCard({ product, isSelected, onSelect }: ProductCardProps) {
  const config = productTypeConfig[product.type ?? ""] // safe lookup
  const Icon = config?.icon
  const typeLabel =
    config?.label ??
    (product.type ? product.type.replace(/_/g, " ") : "N/A") // fallback label

  return (
    <Card
      className={cn(
        "relative cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary shadow-md"
      )}
      onClick={() => onSelect(product)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect(product)
        }
      }}
    >
      {isSelected && (
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
          <Check className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            {Icon ? <Icon className="h-5 w-5 text-primary" /> : null}
          </div>

          <div>
            <Badge variant="secondary" className="mb-1 text-xs">
              {typeLabel}
            </Badge>
            <CardTitle className="text-lg">{product.name}</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <CardDescription className="text-sm leading-relaxed">
          {product.description}
        </CardDescription>

        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">
            {Number(product.interestRate).toFixed(2)}%
          </span>
          <span className="text-sm text-muted-foreground">APY</span>
        </div>

        <div className="text-sm text-muted-foreground">
          {"Min. opening deposit: $"}
          {Number(product.minOpeningDeposit).toLocaleString()}
          {product.termMonths ? (
            <span className="ml-2">
              {"| "}
              {product.termMonths}
              {"-month term"}
            </span>
          ) : null}
        </div>

        <ul className="flex flex-col gap-1.5">
          {(product.features ?? []).map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={isSelected ? "default" : "outline"}
          className="mt-2 w-full"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(product)
          }}
        >
          {isSelected ? "Selected" : "Select This Account"}
        </Button>
      </CardContent>
    </Card>
  )
}