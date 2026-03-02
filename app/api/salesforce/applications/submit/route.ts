import { NextResponse } from "next/server"
import type { AccountApplication } from "@/lib/salesforce/types"
import { isSalesforceConfigured } from "@/lib/config"

const USE_MOCK = !isSalesforceConfigured()

/**
 * POST /api/salesforce/applications/submit
 *
 * Orchestrates the full application submission flow:
 *   1. Create the application record with the selected product
 *   2. Update it with the full applicant data (personal info, KYC, disclosures, funding)
 *   3. Mark the application as submitted
 *
 * Accepts the complete application JSON from all form steps.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      selectedProductId,
      personalInfo,
      kycStatus,
      kycVerificationId,
      disclosureAttestations,
      fundingStatus,
      fundingTransferId,
      fundingAmount,
      linkedAccountMask,
      linkedInstitutionName,
    } = body

    if (!selectedProductId) {
      return NextResponse.json(
        { error: "selectedProductId is required" },
        { status: 400 }
      )
    }

    if (USE_MOCK) {
      // Simulate the 3-step flow with mock data
      const mockId = `APP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
      const now = new Date().toISOString()

      const mockResult: AccountApplication = {
        id: mockId,
        status: "submitted",
        selectedProductId,
        personalInfo,
        kycStatus,
        kycVerificationId,
        disclosureAttestations,
        fundingStatus,
        fundingTransferId,
        fundingAmount,
        linkedAccountMask,
        linkedInstitutionName,
        createdAt: now,
        updatedAt: now,
      }

      return NextResponse.json(mockResult, { status: 201 })
    }

    // Production: 3-step Salesforce flow
    const {
      createApplication,
      updateApplication,
      submitApplication,
    } = await import("@/lib/salesforce/client")

    // Step 1: Create the application
    console.log("[submit] Step 1 createApplication start")
    const created = await createApplication({ selectedProductId })
    console.log("[submit] Step 1 done", created?.id)
    console.log("[submit] Step 2 updateApplication start")
    // Step 2: Update with full applicant data
    await updateApplication(created.id, {
      personalInfo,
      kycStatus,
      kycVerificationId,
      disclosureAttestations,
      fundingStatus,
      fundingTransferId,
      fundingAmount,
      linkedAccountMask,
      linkedInstitutionName,
    })
    console.log("[submit] Step 2 done")
    console.log("[submit] Step 3 submitApplication start")
    // Step 3: Submit the application
    const submitted = await submitApplication(created.id)
    console.log("[submit] Step 3 done")
    return NextResponse.json(submitted, { status: 201 })
  } catch (error) {
    console.error("Failed to submit application:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit application",
      },
      { status: 500 }
    )
  }
}
