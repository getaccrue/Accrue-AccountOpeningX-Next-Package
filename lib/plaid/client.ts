import { Configuration, PlaidApi, PlaidEnvironments } from "plaid"

function getPlaidConfig() {
  const clientId = process.env.PLAID_CLIENT_ID
  const secret = process.env.PLAID_SECRET
  const env = (process.env.PLAID_ENV || "sandbox") as
    | "sandbox"
    | "development"
    | "production"

  if (!clientId || !secret) {
    throw new Error(
      "Missing Plaid environment variables. Required: PLAID_CLIENT_ID, PLAID_SECRET"
    )
  }

  return { clientId, secret, env }
}

let plaidClient: PlaidApi | null = null

export function getPlaidClient(): PlaidApi {
  if (plaidClient) return plaidClient

  const config = getPlaidConfig()

  const configuration = new Configuration({
    basePath:
      PlaidEnvironments[config.env] || PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": config.clientId,
        "PLAID-SECRET": config.secret,
      },
    },
  })

  plaidClient = new PlaidApi(configuration)
  return plaidClient
}
