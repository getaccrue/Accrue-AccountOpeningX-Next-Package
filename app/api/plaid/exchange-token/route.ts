import { NextResponse } from "next/server"

const USE_MOCK = !process.env.PLAID_CLIENT_ID

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (USE_MOCK) {
      return NextResponse.json({
        accessToken: "access-sandbox-mock-token",
        accountId: "mock-account-id",
        institutionName: "Chase",
        accountMask: "1234",
        accountType: "checking",
      })
    }

    const { getPlaidClient } = await import("@/lib/plaid/client")
    const plaid = getPlaidClient()

    // Exchange public token for access token
    const exchangeResponse = await plaid.itemPublicTokenExchange({
      public_token: body.publicToken,
    })

    // Get account details
    const authResponse = await plaid.authGet({
      access_token: exchangeResponse.data.access_token,
    })

    const account = authResponse.data.accounts.find(
      (a) => a.account_id === body.accountId
    ) || authResponse.data.accounts[0]

    // Get institution name
    const item = await plaid.itemGet({
      access_token: exchangeResponse.data.access_token,
    })

    let institutionName = "Your Bank"
    if (item.data.item.institution_id) {
      const inst = await plaid.institutionsGetById({
        institution_id: item.data.item.institution_id,
        country_codes: ["US" as never],
      })
      institutionName = inst.data.institution.name
    }

    return NextResponse.json({
      accessToken: exchangeResponse.data.access_token,
      accountId: account?.account_id,
      institutionName,
      accountMask: account?.mask || "****",
      accountType: account?.subtype || "checking",
    })
  } catch (error) {
    console.error("Failed to exchange token:", error)
    return NextResponse.json(
      { error: "Failed to link bank account" },
      { status: 500 }
    )
  }
}
