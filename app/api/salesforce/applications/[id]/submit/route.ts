import { NextResponse } from "next/server"
import { isSalesforceConfigured } from "@/lib/config"

const USE_MOCK = !isSalesforceConfigured()

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (USE_MOCK) {
      return NextResponse.json({
        id,
        status: "submitted",
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    const { submitApplication } = await import("@/lib/salesforce/client")
    const result = await submitApplication(id)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to submit application:", error)
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    )
  }
}
