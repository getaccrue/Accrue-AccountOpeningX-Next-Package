import { NextResponse } from "next/server"

const USE_MOCK = !process.env.PLAID_CLIENT_ID

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (USE_MOCK) {
      return NextResponse.json({
        transferId: `mock-transfer-${Date.now()}`,
        amount: body.amount,
        status: "pending",
        created: new Date().toISOString(),
      })
    }

    const { getPlaidClient } = await import("@/lib/plaid/client")
    const plaid = getPlaidClient()

    const response = await plaid.transferCreate({
      access_token: body.accessToken,
      account_id: body.accountId,
      authorization_id: body.authorizationId,
      amount: body.amount.toString(),
      description: `Initial deposit - Account Opening`,
    })

    return NextResponse.json({
      transferId: response.data.transfer.id,
      amount: response.data.transfer.amount,
      status: response.data.transfer.status,
      created: response.data.transfer.created,
    })
  } catch (error) {
    console.error("Failed to create transfer:", error)
    return NextResponse.json(
      { error: "Failed to initiate transfer" },
      { status: 500 }
    )
  }
}
