import { NextResponse } from "next/server"
import type { AccountApplication } from "@/lib/salesforce/types"
import { isSalesforceConfigured } from "@/lib/config"

const USE_MOCK = !isSalesforceConfigured()
const REQUIRED_REQUESTED_DOCUMENTS = [
  "Driver License",
  "Income Tax Related Document",
]

function isSalesforceRecordId(value: unknown) {
  return typeof value === "string" && /^[a-zA-Z0-9]{15,18}$/.test(value)
}

function getMissingRequestedDocuments(value: unknown) {
  const uploads = Array.isArray(value) ? value : []
  const uploadedNames = new Set(
    uploads
      .map((upload) =>
        typeof upload?.documentName === "string" ? upload.documentName : ""
      )
      .filter(Boolean)
  )

  return REQUIRED_REQUESTED_DOCUMENTS.filter((name) => !uploadedNames.has(name))
}

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
      applicationId,
      personalInfo,
      kycStatus,
      kycVerificationId,
      disclosureAttestations,
      requestedDocumentUploads,
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

    const missingRequestedDocuments =
      getMissingRequestedDocuments(requestedDocumentUploads)

    if (missingRequestedDocuments.length > 0) {
      return NextResponse.json(
        {
          error: `Missing requested document uploads: ${missingRequestedDocuments.join(
            ", "
          )}`,
        },
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
        requestedDocumentUploads,
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
      createRequestedDocuments,
      updateApplication,
      submitApplication,
    } = await import("@/lib/salesforce/client")

    // Step 1: Reuse an existing Account Opening when it was created earlier.
    console.log("[submit] Step 1 createApplication/reuse start")
    const created = isSalesforceRecordId(applicationId)
      ? { id: applicationId }
      : await createApplication({ selectedProductId })
    console.log("[submit] Step 1 done", created?.id)
    console.log(
      "[submit] Step 2 createRequestedDocuments start",
      requestedDocumentUploads.map(
        (upload: { documentName?: string }) => upload.documentName
      )
    )
    await createRequestedDocuments(created.id, requestedDocumentUploads)
    console.log("[submit] Step 2 done")
    console.log("[submit] Step 3 updateApplication start")
    // Step 3: Update with full applicant data
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
    console.log("[submit] Step 3 done")
    console.log("[submit] Step 4 submitApplication start")
    // Step 4: Submit the application
    const submitted = await submitApplication(created.id)
    console.log("[submit] Step 4 done")
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
