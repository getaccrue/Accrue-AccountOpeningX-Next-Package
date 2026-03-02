"use client"

import { useEffect } from "react"
import { useApplication } from "@/lib/application-context"
import { Confirmation } from "@/components/application/confirmation"

export default function CompletePage() {
  const {
    applicationId,
    selectedProduct,
    personalInfo,
    fundingAmount,
    setCurrentStep,
  } = useApplication()

  useEffect(() => {
    setCurrentStep("complete")
  }, [setCurrentStep])

  return (
    <div>
      <Confirmation
        applicationId={applicationId ?? "PENDING"}
        productName={selectedProduct?.name ?? "Deposit Account"}
        fundingAmount={fundingAmount ?? 0}
        applicantName={personalInfo?.firstName ?? "Applicant"}
      />
    </div>
  )
}
