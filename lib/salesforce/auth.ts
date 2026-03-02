// lib/salesforce/auth.ts
import jsforce from "jsforce"

/**
 * Server-to-server auth using jsforce SOAP login:
 * username + password + security token
 *
 * No browser redirects, no OAuth cookies.
 *
 * NOTE: Password-based auth can be restricted by org security/MFA policies.
 */

let cached:
  | {
      conn: jsforce.Connection
      // epoch ms when we should re-login (conservative)
      expiresAt: number
      loginUrl: string
      username: string
    }
  | null = null

function getLoginConfig() {
  const loginUrl = process.env.SALESFORCE_LOGIN_URL || "https://login.salesforce.com"
  const username = process.env.SALESFORCE_USERNAME
  const password = process.env.SALESFORCE_PASSWORD
  const securityToken = process.env.SALESFORCE_SECURITY_TOKEN

  if (!username || !password || !securityToken) {
    throw new Error(
      "Missing Salesforce env vars. Required: SALESFORCE_USERNAME, SALESFORCE_PASSWORD, SALESFORCE_SECURITY_TOKEN"
    )
  }

  return { loginUrl, username, password, securityToken }
}

/**
 * Get an authenticated jsforce connection (cached in-process).
 */
export async function getSalesforceConnection(): Promise<jsforce.Connection> {
  const { loginUrl, username, password, securityToken } = getLoginConfig()

  // Reuse cached session if still “fresh” and same creds
  if (
    cached &&
    cached.expiresAt > Date.now() + 60_000 &&
    cached.loginUrl === loginUrl &&
    cached.username === username
  ) {
    return cached.conn
  }

  const conn = new jsforce.Connection({ loginUrl })

  // Salesforce expects password + security token concatenated
  await conn.login(username, password + securityToken)

  // jsforce doesn't always expose exact expiry. Use a conservative TTL.
  cached = {
    conn,
    expiresAt: Date.now() + 90 * 60 * 1000, // 90 minutes
    loginUrl,
    username,
  }

  return conn
}
