/**
 * Bank configuration helper.
 * In production, this fetches branding/config from Salesforce.
 * For development, it uses mock data.
 */

import type { BankConfig, DepositProduct, Disclosure } from "./salesforce/types"

// OAuth 2.0 Web Server Flow requires these 3 env vars.
// When all are set, the app uses live Salesforce; otherwise it uses mock data.
// lib/config.ts (replace isSalesforceConfigured)
export function isSalesforceConfigured(): boolean {
  const loginUrl = process.env.SALESFORCE_LOGIN_URL
  const username = process.env.SALESFORCE_USERNAME
  const password = process.env.SALESFORCE_PASSWORD
  const token = process.env.SALESFORCE_SECURITY_TOKEN

  if (!loginUrl || !username || !password || !token) return false
  if (username.startsWith("YOUR_") || password.startsWith("YOUR_") || token.startsWith("YOUR_")) return false

  return true
}



const USE_MOCK = !isSalesforceConfigured()

// Lazy-load the Salesforce client only when needed (avoids pulling in
// jsonwebtoken / auth when running in mock mode)
async function sfClient() {
  const mod = await import("./salesforce/client")
  return mod
}

// ─── Mock Data (for development without Salesforce) ────────────────────

const MOCK_BANK_CONFIG: BankConfig = {
  bankName: "First National Bank",
  logoUrl: "",
  primaryColor: "#0F4C81",
  secondaryColor: "#1A1A2E",
  accentColor: "#10B981",
  kycConfig: {
    idvTemplateName: "default_template",
    requiredSteps: [
      "accept_tos",
      "verify_sms",
      "kyc_check",
      "documentary_verification",
      "selfie_check",
    ],
  },
}

const MOCK_PRODUCTS: DepositProduct[] = [
  {
    id: "prod_checking_01",
    name: "Essential Checking",
    type: "checking",
    description:
      "Our everyday checking account with no monthly maintenance fees and free online banking. Perfect for managing your day-to-day finances.",
    interestRate: 0.01,
    minOpeningDeposit: 25,
    features: [
      "No monthly maintenance fee",
      "Free online & mobile banking",
      "Free debit card",
      "50,000+ fee-free ATMs",
    ],
    active: true,
  },
  {
    id: "prod_checking_02",
    name: "Premium Checking",
    type: "checking",
    description:
      "Earn interest on your balance with premium benefits including higher ATM limits and priority customer service.",
    interestRate: 0.15,
    minOpeningDeposit: 500,
    features: [
      "Interest-bearing account",
      "No ATM fees worldwide",
      "Priority customer service",
      "Free checks",
      "Overdraft protection",
    ],
    active: true,
  },
  {
    id: "prod_savings_01",
    name: "High-Yield Savings",
    type: "savings",
    description:
      "Maximize your savings with a competitive interest rate and no minimum balance requirement after opening.",
    interestRate: 4.25,
    minOpeningDeposit: 100,
    features: [
      "Competitive APY",
      "No minimum balance after opening",
      "Automatic savings tools",
      "FDIC insured up to $250,000",
    ],
    active: true,
  },
  {
    id: "prod_savings_02",
    name: "Money Market Account",
    type: "money_market",
    description:
      "Combine the benefits of savings and checking with check-writing privileges and a higher interest rate.",
    interestRate: 3.75,
    minOpeningDeposit: 2500,
    features: [
      "Check-writing privileges",
      "Tiered interest rates",
      "Free debit card access",
      "FDIC insured up to $250,000",
    ],
    active: true,
  },
  {
    id: "prod_cd_01",
    name: "12-Month CD",
    type: "cd",
    description:
      "Lock in a guaranteed rate for 12 months. Ideal for short-term savings goals with a fixed return.",
    interestRate: 4.5,
    minOpeningDeposit: 1000,
    termMonths: 12,
    features: [
      "Guaranteed fixed rate",
      "FDIC insured up to $250,000",
      "Automatic renewal option",
      "Interest paid monthly",
    ],
    active: true,
  },
]

const MOCK_DISCLOSURES: Disclosure[] = [
  {
    id: "disc_esign",
    title: "Electronic Signature & Consent Agreement",
    description:
      "By consenting, you agree to receive all account-related documents electronically.",
    pdfUrl: "/mock/disclosures/esign-consent.pdf",
    required: true,
    sortOrder: 1,
    scope: "bank",
  },
  {
    id: "disc_privacy",
    title: "Privacy Policy",
    description:
      "Learn how we collect, use, and protect your personal information.",
    pdfUrl: "/mock/disclosures/privacy-policy.pdf",
    required: true,
    sortOrder: 2,
    scope: "bank",
  },
  {
    id: "disc_patriot",
    title: "USA PATRIOT Act Notice",
    description:
      "Federal law requires all financial institutions to verify the identity of each person opening an account.",
    pdfUrl: "/mock/disclosures/patriot-act.pdf",
    required: true,
    sortOrder: 3,
    scope: "bank",
  },
  {
    id: "disc_account_agreement",
    title: "Deposit Account Agreement",
    description:
      "Terms and conditions governing your deposit account including fees, interest rates, and account policies.",
    pdfUrl: "/mock/disclosures/account-agreement.pdf",
    required: true,
    sortOrder: 4,
    scope: "product",
  },
  {
    id: "disc_fee_schedule",
    title: "Fee Schedule",
    description:
      "Complete schedule of fees associated with your account type.",
    pdfUrl: "/mock/disclosures/fee-schedule.pdf",
    required: true,
    sortOrder: 5,
    scope: "product",
  },
  {
    id: "disc_funds_availability",
    title: "Funds Availability Policy",
    description:
      "Information about when deposited funds will be available for withdrawal.",
    pdfUrl: "/mock/disclosures/funds-availability.pdf",
    required: false,
    sortOrder: 6,
    scope: "bank",
  },
]

// ─── Public API ────────────────────────────────────────────────────────
// Each function tries the live Salesforce client first (when configured)
// and gracefully falls back to mock data if auth hasn't been completed
// or the SF call fails for any reason.

export async function fetchBankConfig(): Promise<BankConfig> {
  if (USE_MOCK) return MOCK_BANK_CONFIG
  try {
    const { getBankConfig } = await sfClient()
    return await getBankConfig()
  } catch (err) {
    console.warn("[v0] Salesforce fetchBankConfig failed, using mock data:", (err as Error).message)
    return MOCK_BANK_CONFIG
  }
}

export async function fetchProducts(): Promise<DepositProduct[]> {
  console.log("[fetchProducts] isSalesforceConfigured =", isSalesforceConfigured())

  if (!isSalesforceConfigured()) {
    console.log("[fetchProducts] Returning MOCK (not configured)")
    return MOCK_PRODUCTS.filter((p) => p.active)
  }

  try {
    const { getProducts } = await import("@/lib/salesforce/client")
    const sf = await getProducts()
    console.log("[fetchProducts] Salesforce OK count =", sf.length)
    return sf
  } catch (err: any) {
    console.error("[fetchProducts] Salesforce FAILED:", err?.message)
    // you can keep fallback if you want:
    return MOCK_PRODUCTS.filter((p) => p.active)
  }
}

export async function fetchDisclosures(
  productId: string
): Promise<Disclosure[]> {
  if (USE_MOCK)
    return MOCK_DISCLOSURES.sort((a, b) => a.sortOrder - b.sortOrder)
  try {
    const { getProductDisclosures } = await sfClient()
    return await getProductDisclosures(productId)
  } catch (err) {
    console.warn("[v0] Salesforce fetchDisclosures failed, using mock data:", (err as Error).message)
    return MOCK_DISCLOSURES.sort((a, b) => a.sortOrder - b.sortOrder)
  }
}

export function getS3DisclosureBaseUrl(): string {
  return process.env.AWS_S3_DISCLOSURES_BASE_URL || ""
}
