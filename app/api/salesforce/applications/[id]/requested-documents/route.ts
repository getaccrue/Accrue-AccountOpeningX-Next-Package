import { NextResponse } from "next/server"
import { isSalesforceConfigured } from "@/lib/config"

const USE_MOCK = !isSalesforceConfigured()

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const requestedDocumentUploads = Array.isArray(body.requestedDocumentUploads)
      ? body.requestedDocumentUploads
      : body.requestedDocumentUpload
        ? [body.requestedDocumentUpload]
        : []

    if (!id) {
      return NextResponse.json(
        { error: "Application id is required" },
        { status: 400 }
      )
    }

    if (USE_MOCK) {
      return NextResponse.json({
        ids: requestedDocumentUploads.map(
          (_: unknown, index: number) =>
            `REQ-${Date.now().toString(36).toUpperCase()}-${index + 1}`
        ),
      })
    }

    const { createRequestedDocuments } = await import("@/lib/salesforce/client")
    const result = await createRequestedDocuments(id, requestedDocumentUploads)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Failed to create requested documents:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create requested documents",
      },
      { status: 500 }
    )
  }
}
