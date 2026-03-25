"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useApplication } from "@/lib/application-context"
import { ReviewSummary } from "@/components/application/review-summary"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export default function ReviewPage() {
  const router = useRouter()
  const {
    selectedProduct,
    personalInfo,
    kycStatus,
    kycVerificationId,
    disclosureAttestations,
    fundingStatus,
    fundingTransferId,
    fundingAmount,
    linkedAccountMask,
    linkedInstitutionName,
    setCurrentStep,
    setApplicationId,
  } = useApplication()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    setCurrentStep("review")
  }, [setCurrentStep])

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)

    // Build the complete application payload from all form steps
    const applicationPayload = {
      selectedProductId: selectedProduct?.id,
      personalInfo,
      kycStatus,
      kycVerificationId,
      disclosureAttestations,
      fundingStatus,
      fundingTransferId,
      fundingAmount,
      linkedAccountMask,
      linkedInstitutionName,
    }

    try {
      const response = await fetch("/api/salesforce/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationPayload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `Submission failed (${response.status})`
        )
      }

      const result = await response.json()

		// Prefer your reference number; fall back to SF id if it's not ready yet
		const referenceNumber = result.accountnumber ?? result.accountNumber ?? result.coreAccountId ?? result.id

		if (referenceNumber) {
		  setApplicationId(referenceNumber)
		}

		toast.success("Application submitted successfully!", {
		  description: `Reference Number: ${referenceNumber}`,
		})

      setCurrentStep("complete")
      router.push("/apply/complete")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      setSubmitError(message)
      toast.error("Submission failed", { description: message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Review Your Application
        </h1>
        <p className="mt-1 text-muted-foreground">
          Please review all the details below before submitting your
          application. You can go back to any step to make changes.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <ReviewSummary
          product={selectedProduct}
          personalInfo={personalInfo}
          kycStatus={kycStatus}
          disclosureAttestations={disclosureAttestations}
          fundingAmount={fundingAmount}
          linkedAccountMask={linkedAccountMask}
          linkedInstitutionName={linkedInstitutionName}
        />
      </div>

      {/* Error banner */}
      {submitError && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-foreground">Submission failed</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {submitError}
            </p>
          </div>
        </div>
      )}

      {/* Legal acknowledgment */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-xs text-muted-foreground">
          {"By submitting this application, I certify that all information provided is true, accurate, and complete to the best of my knowledge. I understand that providing false information may result in denial of my application or closure of my account. I authorize the bank to verify the information provided and to obtain credit reports as necessary."}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => router.push("/apply/funding")}
          className="gap-2"
          disabled={submitting}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={submitting}
          className="gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit Application
              <Send className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
