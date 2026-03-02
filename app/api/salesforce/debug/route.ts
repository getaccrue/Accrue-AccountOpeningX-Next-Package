import { NextResponse } from "next/server"
import { isSalesforceConfigured } from "@/lib/config"
import { isSalesforceAuthorized } from "@/lib/salesforce/auth"

/**
 * GET /api/salesforce/debug
 *
 * Returns the current Salesforce connection status so you can
 * quickly check whether the app is using mock data or live SF.
 */
export async function GET() {
  const configured = isSalesforceConfigured()
  const authorized = isSalesforceAuthorized()

  const status = {
    mode: !configured ? "MOCK" : !authorized ? "CONFIGURED_BUT_NOT_AUTHORIZED" : "LIVE_SALESFORCE",
    envVars: {
      SALESFORCE_INSTANCE_URL: process.env.SALESFORCE_INSTANCE_URL ? "SET" : "MISSING",
      SALESFORCE_CLIENT_ID: process.env.SALESFORCE_CLIENT_ID ? "SET" : "MISSING",
      SALESFORCE_CLIENT_SECRET: process.env.SALESFORCE_CLIENT_SECRET
        ? process.env.SALESFORCE_CLIENT_SECRET.startsWith("YOUR_")
          ? "PLACEHOLDER"
          : "SET"
        : "MISSING",
    },
    isSalesforceConfigured: configured,
    isSalesforceAuthorized: authorized,
    explanation: !configured
      ? "App is using MOCK DATA. Set all 3 env vars with real values to enable Salesforce."
      : !authorized
        ? "Env vars are set but OAuth login has not been completed. Visit /api/salesforce/oauth/login to authorize."
        : "App is connected to LIVE SALESFORCE and fetching real data.",
    nextStep: !configured
      ? "Add SALESFORCE_INSTANCE_URL, SALESFORCE_CLIENT_ID, and SALESFORCE_CLIENT_SECRET to .env.local"
      : !authorized
        ? "Visit /api/salesforce/oauth/login in your browser to complete the OAuth flow"
        : "All good! Products and disclosures are coming from Salesforce.",
  }

  return NextResponse.json(status, { status: 200 })
}
