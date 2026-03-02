"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useApplication } from "@/lib/application-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  ArrowRight,
  Landmark,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Loader2,
} from "lucide-react"

export default function FundingPage() {
  const router = useRouter()
  const {
    selectedProduct,
    setCurrentStep,
    setFundingResult,
    fundingStatus,
  } = useApplication()
  const [step, setStep] = useState<"link" | "amount" | "processing" | "done">(
    fundingStatus === "completed" ? "done" : "link"
  )
  const [amount, setAmount] = useState(
    selectedProduct?.minOpeningDeposit
      ? selectedProduct.minOpeningDeposit.toString()
      : ""
  )
  const [amountError, setAmountError] = useState<string | null>(null)

  useEffect(() => {
    setCurrentStep("funding")
  }, [setCurrentStep])

  const handleMockLink = () => {
    // Simulate linking a bank account
    setStep("amount")
  }

  const handleInitiateTransfer = () => {
    const numericAmount = parseFloat(amount)
    const minDeposit = selectedProduct?.minOpeningDeposit || 0

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setAmountError("Please enter a valid amount greater than $0")
      return
    }
    if (numericAmount < minDeposit) {
      setAmountError(`Minimum initial deposit is $${minDeposit.toFixed(2)}`)
      return
    }
    if (numericAmount > 100000) {
      setAmountError("Maximum initial deposit is $100,000.00")
      return
    }

    setAmountError(null)
    setStep("processing")

    // Simulate transfer processing
    setTimeout(() => {
      setStep("done")
      setFundingResult(
        "completed",
        `TRF-${Date.now().toString(36).toUpperCase()}`,
        numericAmount,
        "1234",
        "Chase"
      )
    }, 2000)
  }

  const minDeposit = selectedProduct?.minOpeningDeposit ?? 25

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Fund Your Account
        </h1>
        <p className="mt-1 text-muted-foreground">
          Link an external bank account and make your initial deposit to your
          new{" "}
          <span className="font-medium text-foreground">
            {selectedProduct?.name ?? "new"}
          </span>{" "}
          account.
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        {step === "done" ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-success/30 bg-success/5 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">
                Funding Initiated
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                ${parseFloat(amount).toFixed(2)} transfer from Chase (****1234)
                has been initiated. Funds typically arrive in 2-3 business days.
              </p>
            </div>
          </div>
        ) : step === "processing" ? (
          <div className="flex flex-col items-center gap-6 py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">
                Processing Transfer
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Authorizing and initiating your deposit. This may take a
                moment...
              </p>
            </div>
          </div>
        ) : step === "amount" ? (
          <div className="flex flex-col gap-6 p-6">
            {/* Linked account summary */}
            <div className="flex items-center gap-4 rounded-lg border bg-muted/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Landmark className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Chase</p>
                <p className="text-xs text-muted-foreground">
                  Checking ****1234
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>

            {/* Amount input */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="funding-amount" className="text-sm font-medium">
                Initial Deposit Amount
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="funding-amount"
                  type="number"
                  step="0.01"
                  min={minDeposit}
                  max={100000}
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value)
                    setAmountError(null)
                  }}
                  className="pl-9"
                  placeholder={`Minimum $${minDeposit.toFixed(2)}`}
                />
              </div>
              {amountError && (
                <div className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {amountError}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Minimum initial deposit: ${minDeposit.toFixed(2)}. Maximum:
                $100,000.00
              </p>
            </div>

            <Button
              size="lg"
              onClick={handleInitiateTransfer}
              className="gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Fund Account
            </Button>
          </div>
        ) : (
          /* Link step */
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Landmark className="h-10 w-10 text-primary" />
            </div>
            <div className="max-w-md text-center">
              <h3 className="text-lg font-semibold text-foreground">
                Link Your Bank Account
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Securely connect an external bank account to fund your new
                deposit account. We use Plaid to establish a secure connection.
              </p>
            </div>
            <Button size="lg" onClick={handleMockLink} className="gap-2">
              <Landmark className="h-4 w-4" />
              Connect Bank Account
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {"Your bank credentials are encrypted and handled securely by Plaid. We never have access to your login details."}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => router.push("/apply/disclosures")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          size="lg"
          disabled={step !== "done"}
          onClick={() => router.push("/apply/review")}
          className="gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
