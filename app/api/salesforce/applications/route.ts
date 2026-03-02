import { NextResponse } from "next/server"
import type { AccountApplication } from "@/lib/salesforce/types"
import { isSalesforceConfigured } from "@/lib/config"

const USE_MOCK = !isSalesforceConfigured()

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (USE_MOCK) {
      const mockApp: AccountApplication = {
        id: `APP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        status: "started",
        selectedProductId: body.selectedProductId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return NextResponse.json(mockApp, { status: 201 })
    }

    // Production: forward to Salesforce
    const { createApplication } = await import("@/lib/salesforce/client")
    const application = await createApplication(body)
    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error("Failed to create application:", error)
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    )
  }
}
