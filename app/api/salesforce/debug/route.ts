import { NextResponse } from "next/server"
import { getSalesforceConnection } from "@/lib/salesforce/auth"

export async function GET() {
  const envVars = {
    SALESFORCE_LOGIN_URL: process.env.SALESFORCE_LOGIN_URL ? "SET" : "MISSING",
    SALESFORCE_USERNAME: process.env.SALESFORCE_USERNAME ? "SET" : "MISSING",
    SALESFORCE_PASSWORD: process.env.SALESFORCE_PASSWORD ? "SET" : "MISSING",
    SALESFORCE_SECURITY_TOKEN: process.env.SALESFORCE_SECURITY_TOKEN ? "SET" : "MISSING",
  }

  const configured =
    envVars.SALESFORCE_USERNAME === "SET" &&
    envVars.SALESFORCE_PASSWORD === "SET" &&
    envVars.SALESFORCE_SECURITY_TOKEN === "SET"

  if (!configured) {
    return NextResponse.json({
      mode: "MOCK_OR_NOT_CONFIGURED",
      envVars,
      isSalesforceConfigured: configured,
      explanation:
        "Missing SOAP-login env vars. Set SALESFORCE_USERNAME, SALESFORCE_PASSWORD, SALESFORCE_SECURITY_TOKEN (and optionally SALESFORCE_LOGIN_URL).",
      nextStep:
        "Add these env vars to Amplify (branch env vars) and redeploy, or to .env.local for local dev.",
    })
  }

  try {
    const conn = await getSalesforceConnection()
    const ident = await conn.identity()

    return NextResponse.json({
      mode: "LIVE_SALESFORCE",
      envVars,
      isSalesforceConfigured: true,
      identity: {
        username: ident.username,
        orgId: ident.organization_id,
        userId: ident.user_id,
      },
      explanation: "Successfully logged into Salesforce using username+password+security token.",
      nextStep: "If data is still missing, the issue is object permissions or SOQL query logic.",
    })
  } catch (e: any) {
    return NextResponse.json({
      mode: "CONFIGURED_BUT_LOGIN_FAILED",
      envVars,
      isSalesforceConfigured: true,
      error: e?.message ?? String(e),
      explanation:
        "Env vars exist but Salesforce login failed (bad creds, wrong login URL, expired token, or org security restriction).",
      nextStep:
        "Use SALESFORCE_LOGIN_URL=https://login.salesforce.com (or https://test.salesforce.com for sandbox) and reset security token, then update env vars in Amplify.",
    })
  }
}