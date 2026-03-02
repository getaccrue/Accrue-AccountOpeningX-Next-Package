"use client"

import { useCallback, useState, useEffect } from "react"
import { usePlaidLink } from "react-plaid-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Landmark,
  CheckCircle2,
  Loader2,
  AlertCircle,
  DollarSign,
} from "lucide-react"

interface LinkedAccount {
  accessToken: string
  accountId: string
  institutionName: string
  accountMask: string
  accountType: string
}

interface PlaidFundingProps {
  linkToken: string | null
  isLoading: boolean
  minDeposit: number
  onFundingComplete: (result: {
    transferId: string
    amount: number
    accountMask: string
    institutionName: string
  }) => void
  onError: (error: string) => void
}

export function PlaidFunding({
  linkToken,
  isLoading,
  minDeposit,
  onFundingComplete,
  onError,
}: PlaidFundingProps) {
  const [step, setStep] = useState<"link" | "amount" | "processing" | "done">(
    "link"
  )
  const [linkedAccount, setLinkedAccount] = useState<LinkedAccount | null>(null)
  const [amount, setAmount] = useState(minDeposit > 0 ? minDeposit.toString() : "")
  const [amountError, setAmountError] = useState<string | null>(null)

  const isMock = linkToken === "link-sandbox-mock-funding-token"

  const onPlaidSuccess = useCallback(
    async (publicToken: string, metadata: { accounts?: Array<{ id: string }> }) => {
      try {
        if (isMock) {
          setLinkedAccount({
            accessToken: "access-sandbox-mock-token",
            accountId: "mock-account-id",
            institutionName: "Chase",
            accountMask: "1234",
            accountType: "checking",
          })
          setStep("amount")
          return
        }

        const accountId = metadata?.accounts?.[0]?.id || ""

        const res = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicToken, accountId }),
        })
        const data = await res.json()

        if (data.error) {
          onError(data.error)
          return
        }

        setLinkedAccount(data)
        setStep("amount")
      } catch {
        onError("Failed to link bank account. Please try again.")
      }
    },
    [isMock, onError]
  )

  const onPlaidExit = useCallback(
    (err: { error_message?: string } | null) => {
      if (err) {
        onError(err.error_message || "Account linking was canceled.")
      }
    },
    [onError]
  )

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  })

  const handleMockLink = () => {
    onPlaidSuccess("mock-public-token", { accounts: [{ id: "mock-account" }] })
  }

  const handleInitiateTransfer = async () => {
    if (!linkedAccount) return

    const numericAmount = parseFloat(amount)
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

    try {
      // Step 1: Authorize the transfer
      const authRes = await fetch("/api/plaid/transfer/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: linkedAccount.accessToken,
          accountId: linkedAccount.accountId,
          amount: numericAmount,
          legalName: "Account Holder",
        }),
      })
      const authData = await authRes.json()

      if (authData.decision !== "approved") {
        setStep("amount")
        onError(
          authData.decisionRationale?.description ||
            "Transfer was not approved. Please try a different account or amount."
        )
        return
      }

      // Step 2: Create the transfer
      const transferRes = await fetch("/api/plaid/transfer/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: linkedAccount.accessToken,
          accountId: linkedAccount.accountId,
          authorizationId: authData.authorizationId,
          amount: numericAmount,
        }),
      })
      const transferData = await transferRes.json()

      if (transferData.error) {
        setStep("amount")
        onError(transferData.error)
        return
      }

      setStep("done")
      onFundingComplete({
        transferId: transferData.transferId,
        amount: numericAmount,
        accountMask: linkedAccount.accountMask,
        institutionName: linkedAccount.institutionName,
      })
    } catch {
      setStep("amount")
      onError("Transfer failed. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Preparing account linking...</p>
      </div>
    )
  }

  if (step === "done") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-success/30 bg-success/5 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            Funding Initiated
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            ${parseFloat(amount).toFixed(2)} transfer from{" "}
            {linkedAccount?.institutionName} (****
            {linkedAccount?.accountMask}) has been initiated. Funds typically
            arrive in 2-3 business days.
          </p>
        </div>
      </div>
    )
  }

  if (step === "processing") {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            Processing Transfer
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Authorizing and initiating your deposit. This may take a moment...
          </p>
        </div>
      </div>
    )
  }

  if (step === "amount" && linkedAccount) {
    return (
      <div className="flex flex-col gap-6 py-4">
        {/* Linked account summary */}
        <div className="flex items-center gap-4 rounded-lg border bg-muted/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Landmark className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {linkedAccount.institutionName}
            </p>
            <p className="text-xs text-muted-foreground">
              {linkedAccount.accountType.charAt(0).toUpperCase() +
                linkedAccount.accountType.slice(1)}{" "}
              ****{linkedAccount.accountMask}
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

        <Button size="lg" onClick={handleInitiateTransfer} className="gap-2">
          <DollarSign className="h-4 w-4" />
          Fund Account
        </Button>
      </div>
    )
  }

  // Link step (default)
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Landmark className="h-10 w-10 text-primary" />
      </div>
      <div className="max-w-md text-center">
        <h3 className="text-lg font-semibold text-foreground">
          Link Your Bank Account
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Securely connect an external bank account to fund your new deposit
          account. We use Plaid to establish a secure connection.
        </p>
      </div>
      <Button
        size="lg"
        onClick={isMock ? handleMockLink : () => ready && open()}
        disabled={!isMock && !ready}
        className="gap-2"
      >
        <Landmark className="h-4 w-4" />
        Connect Bank Account
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {"Your bank credentials are encrypted and handled securely by Plaid. We never have access to your login details."}
      </p>
    </div>
  )
}
