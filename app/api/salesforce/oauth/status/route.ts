import { NextResponse } from "next/server"
import { isSalesforceAuthorized } from "@/lib/salesforce/auth"

export async function GET() {
  return NextResponse.json({
    connected: isSalesforceAuthorized(),
  })
}
