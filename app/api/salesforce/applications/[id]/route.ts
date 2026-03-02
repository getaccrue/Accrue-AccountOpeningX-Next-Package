import { NextResponse } from "next/server"
import { isSalesforceConfigured } from "@/lib/config"

const USE_MOCK = !isSalesforceConfigured()

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (USE_MOCK) {
      // Return the updated fields back as confirmation
      return NextResponse.json({
        id,
        ...body,
        updatedAt: new Date().toISOString(),
      })
    }

    const { updateApplication } = await import("@/lib/salesforce/client")
    const updated = await updateApplication(id, body)
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update application:", error)
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    )
  }
}
