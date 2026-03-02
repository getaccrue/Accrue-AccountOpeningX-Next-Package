// lib/salesforce/client.ts
import { getSalesforceConnection } from "./auth"
import type {
  BankConfig,
  DepositProduct,
  Disclosure,
  AccountApplication,
} from "./types"

const API_BASE = "/accrue/dao/v1"

/**
 * Call your Salesforce Apex REST endpoints using jsforce.
 * This keeps the same shape as your previous sfFetch().
 */
async function sfFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const conn = await getSalesforceConnection()
  const url = `${API_BASE}${path}`

  const method = (options.method || "GET").toUpperCase()
  const headers = (options.headers || {}) as Record<string, string>

  // jsforce conn.apex.* automatically uses the session + instanceUrl
  // We just pass path and body.
  try {
    if (method === "GET") {
      return (await conn.apex.get(url)) as T
    }

    if (method === "POST") {
      const body = options.body ? JSON.parse(String(options.body)) : {}
      return (await conn.apex.post(url, body)) as T
    }

    if (method === "PATCH") {
      const body = options.body ? JSON.parse(String(options.body)) : undefined
      return (await conn.apex.patch(url, body)) as T
    }

    if (method === "PUT") {
      const body = options.body ? JSON.parse(String(options.body)) : undefined
      return (await conn.apex.put(url, body)) as T
    }

    if (method === "DELETE") {
      return (await conn.apex.del(url)) as T
    }

    throw new Error(`Unsupported method: ${method}`)
  } catch (e: any) {
    // Bubble up a helpful message
    throw new Error(`Salesforce Apex REST error calling ${method} ${url}: ${e?.message || e}`)
  }
}

// ─── Bank Config ───────────────────────────────────────────────────────

export async function getBankConfig(): Promise<BankConfig> {
  return sfFetch<BankConfig>("/config")
}

// ─── Products ──────────────────────────────────────────────────────────

export async function getProducts(): Promise<DepositProduct[]> {
  return sfFetch<DepositProduct[]>("/products")
}

// ─── Disclosures ───────────────────────────────────────────────────────

export async function getProductDisclosures(productId: string): Promise<Disclosure[]> {
  return sfFetch<Disclosure[]>(`/products/${productId}/disclosures`)
}

// ─── Applications ──────────────────────────────────────────────────────

export async function createApplication(data: {
  selectedProductId: string
}): Promise<AccountApplication> {
  return sfFetch<AccountApplication>("/applications", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateApplication(
  id: string,
  data: Partial<AccountApplication>
): Promise<AccountApplication> {
  return sfFetch<AccountApplication>(`/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function submitApplication(id: string): Promise<AccountApplication> {
  return sfFetch<AccountApplication>(`/applications/${id}/submit`, {
    method: "POST",
  })
}
