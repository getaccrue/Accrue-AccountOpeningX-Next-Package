import { NextResponse } from "next/server"
import { fetchBankConfig } from "@/lib/config"

export async function GET() {
  try {
    const config = await fetchBankConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error("Failed to fetch bank config:", error)
    return NextResponse.json(
      { error: "Failed to fetch bank configuration" },
      { status: 500 }
    )
  }
}
