import { NextResponse } from "next/server"

const USE_MOCK = !process.env.PLAID_CLIENT_ID

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (USE_MOCK) {
      // Return a mock link token for development
      return NextResponse.json({
        linkToken: "link-sandbox-mock-idv-token",
        expiration: new Date(Date.now() + 3600000).toISOString(),
      })
    }

    const { getPlaidClient } = await import("@/lib/plaid/client")
    const { Products, CountryCode } = await import("plaid")
    const plaid = getPlaidClient()

    const response = await plaid.linkTokenCreate({
      user: {
        client_user_id: body.userId || `user-${Date.now()}`,
        email_address: body.email,
      },
      client_name: "Account Opening",
      products: [Products.IdentityVerification],
      identity_verification: {
        template_id: body.templateId || "default_template",
      },
      country_codes: [CountryCode.Us],
      language: "en",
    })

    return NextResponse.json({
      linkToken: response.data.link_token,
      expiration: response.data.expiration,
    })
  } catch (error) {
    console.error("Failed to create IDV link token:", error)
    return NextResponse.json(
      { error: "Failed to create identity verification token" },
      { status: 500 }
    )
  }
}
