import { NextResponse } from "next/server"

const USE_MOCK = !process.env.PLAID_CLIENT_ID

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (USE_MOCK) {
      return NextResponse.json({
        authorizationId: `mock-auth-${Date.now()}`,
        decision: "approved",
      })
    }

    const { getPlaidClient } = await import("@/lib/plaid/client")
    const { TransferType, TransferNetwork, ACHClass } = await import("plaid")
    const plaid = getPlaidClient()

    const response = await plaid.transferAuthorizationCreate({
      access_token: body.accessToken,
      account_id: body.accountId,
      type: TransferType.Debit,
      network: TransferNetwork.Ach,
      amount: body.amount.toString(),
      ach_class: ACHClass.Ppd,
      user: {
        legal_name: body.legalName,
      },
    })

    return NextResponse.json({
      authorizationId: response.data.authorization.id,
      decision: response.data.authorization.decision,
      decisionRationale: response.data.authorization.decision_rationale,
    })
  } catch (error) {
    console.error("Failed to authorize transfer:", error)
    return NextResponse.json(
      { error: "Failed to authorize transfer" },
      { status: 500 }
    )
  }
}
