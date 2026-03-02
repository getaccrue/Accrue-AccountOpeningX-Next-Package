"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useApplication } from "@/lib/application-context"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react"
import type { KycStatus } from "@/lib/salesforce/types"

const MOCK_IDV_STEPS = [
  "Verifying identity document...",
  "Matching selfie to document...",
  "Running background check...",
  "Finalizing verification...",
]

export default function KycPage() {
  const router = useRouter()
  const {
    setCurrentStep,
    setKycResult,
    kycStatus,
  } = useApplication()
  const [idvState, setIdvState] = useState<
    "ready" | "verifying" | "success"
  >(kycStatus === "passed" ? "success" : "ready")
  const [mockStep, setMockStep] = useState(0)

  useEffect(() => {
    setCurrentStep("kyc")
  }, [setCurrentStep])

  // Simulated IDV progress
  useEffect(() => {
    if (idvState === "verifying") {
      if (mockStep < MOCK_IDV_STEPS.length) {
        const timer = setTimeout(() => {
          setMockStep((prev) => prev + 1)
        }, 1200)
        return () => clearTimeout(timer)
      } else {
        setIdvState("success")
        setKycResult("passed", `idv-mock-${Date.now()}`)
      }
    }
  }, [idvState, mockStep, setKycResult])

  const handleStartVerification = () => {
    setIdvState("verifying")
    setMockStep(0)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Verify Your Identity
        </h1>
        <p className="mt-1 text-muted-foreground">
          Federal regulations require us to verify your identity before opening
          an account. This secure process takes just a few minutes.
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        {idvState === "success" ? (
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
        ) : idvState === "verifying" ? (
          <div className="flex flex-col items-center gap-6 py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">
                Verifying Your Identity
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {MOCK_IDV_STEPS[mockStep] || "Almost done..."}
              </p>
            </div>
            <div className="flex w-full max-w-xs gap-1.5 px-4">
              {MOCK_IDV_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                    i <= mockStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <div className="max-w-md text-center">
              <h3 className="text-lg font-semibold text-foreground">
                Verify Your Identity
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We use Plaid to securely verify your identity. You may be asked
                to scan a government-issued ID and take a selfie. This process
                typically takes 2-3 minutes.
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleStartVerification}
              className="gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Start Verification
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {"Your data is encrypted and handled securely by Plaid. We do not store images of your ID or selfie."}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => router.push("/apply/personal")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          size="lg"
          disabled={idvState !== "success"}
          onClick={() => router.push("/apply/disclosures")}
          className="gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
