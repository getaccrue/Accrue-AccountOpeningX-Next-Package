"use client"

import { useCallback, useState, useEffect } from "react"
import { usePlaidLink } from "react-plaid-link"
import { Button } from "@/components/ui/button"
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  RefreshCcw,
} from "lucide-react"
import type { KycStatus } from "@/lib/salesforce/types"

interface PlaidIdvProps {
  linkToken: string | null
  isLoading: boolean
  onSuccess: (status: KycStatus, verificationId: string) => void
  onError: (error: string) => void
}

export function PlaidIdv({
  linkToken,
  isLoading,
  onSuccess,
  onError,
}: PlaidIdvProps) {
  const [idvState, setIdvState] = useState<
    "ready" | "verifying" | "success" | "failed" | "review"
  >("ready")

  const onPlaidSuccess = useCallback(
    (publicToken: string, metadata: Record<string, unknown>) => {
      // For IDV, the metadata contains the verification session info
      // In mock mode, we simulate a successful verification
      const verificationId =
        (metadata as { identity_verification_id?: string })
          .identity_verification_id || `idv-mock-${Date.now()}`

      setIdvState("success")
      onSuccess("passed", verificationId)
    },
    [onSuccess]
  )

  const onPlaidExit = useCallback(
    (err: { error_code?: string; error_message?: string } | null) => {
      if (err) {
        setIdvState("failed")
        onError(err.error_message || "Identity verification was not completed")
      }
    },
    [onError]
  )

  const onPlaidEvent = useCallback(
    (eventName: string) => {
      if (eventName === "IDENTITY_VERIFICATION_START_STEP") {
        setIdvState("verifying")
      }
      if (eventName === "IDENTITY_VERIFICATION_PENDING_REVIEW_STEP") {
        setIdvState("review")
        onSuccess("review", `idv-review-${Date.now()}`)
      }
    },
    [onSuccess]
  )

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
    onEvent: onPlaidEvent,
  })

  // For mock mode, we provide a simulated IDV flow
  const [mockStep, setMockStep] = useState(0)
  const isMock = linkToken === "link-sandbox-mock-idv-token"

  const mockSteps = [
    "Verifying identity document...",
    "Matching selfie to document...",
    "Running background check...",
    "Finalizing verification...",
  ]

  useEffect(() => {
    if (isMock && idvState === "verifying") {
      if (mockStep < mockSteps.length) {
        const timer = setTimeout(() => {
          setMockStep((prev) => prev + 1)
        }, 1500)
        return () => clearTimeout(timer)
      } else {
        setIdvState("success")
        onSuccess("passed", `idv-mock-${Date.now()}`)
      }
    }
  }, [isMock, idvState, mockStep, mockSteps.length, onSuccess])

  const handleStartVerification = () => {
    if (isMock) {
      setIdvState("verifying")
      setMockStep(0)
      return
    }
    if (ready) {
      open()
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          Preparing identity verification...
        </p>
      </div>
    )
  }

  if (idvState === "success") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-success/30 bg-success/5 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <ShieldCheck className="h-8 w-8 text-success" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            Identity Verified
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your identity has been successfully verified. You can proceed to
            the next step.
          </p>
        </div>
      </div>
    )
  }

  if (idvState === "review") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-warning/30 bg-warning/5 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
          <ShieldCheck className="h-8 w-8 text-warning" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            Verification Under Review
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your identity verification is being reviewed. You may still
            continue with your application.
          </p>
        </div>
      </div>
    )
  }

  if (idvState === "failed") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-destructive/30 bg-destructive/5 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            Verification Failed
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            We were unable to verify your identity. Please try again or
            contact support.
          </p>
        </div>
        <Button variant="outline" onClick={handleStartVerification} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  if (idvState === "verifying" && isMock) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            Verifying Your Identity
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {mockSteps[mockStep] || "Almost done..."}
          </p>
        </div>
        <div className="flex w-full max-w-xs gap-1.5">
          {mockSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                i <= mockStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    )
  }

  // Ready state
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <ShieldCheck className="h-10 w-10 text-primary" />
      </div>
      <div className="max-w-md text-center">
        <h3 className="text-lg font-semibold text-foreground">
          Verify Your Identity
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We use Plaid to securely verify your identity. You may be asked to
          scan a government-issued ID and take a selfie. This process
          typically takes 2-3 minutes.
        </p>
      </div>
      <Button
        size="lg"
        onClick={handleStartVerification}
        disabled={!isMock && !ready}
        className="gap-2"
      >
        <ShieldCheck className="h-4 w-4" />
        Start Verification
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {"Your data is encrypted and handled securely by Plaid. We do not store images of your ID or selfie."}
      </p>
    </div>
  )
}
