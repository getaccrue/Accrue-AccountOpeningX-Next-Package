import { NextResponse } from "next/server"
import { fetchDisclosures } from "@/lib/config"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const disclosures = await fetchDisclosures(productId)
    return NextResponse.json(disclosures)
  } catch (error) {
    console.error("Failed to fetch disclosures:", error)
    return NextResponse.json(
      { error: "Failed to fetch disclosures" },
      { status: 500 }
    )
  }
}
