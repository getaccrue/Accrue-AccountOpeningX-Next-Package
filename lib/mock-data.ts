/**
 * Mock data for the POC demo. All data is client-accessible -- no API calls needed.
 * In production, this data would come from Salesforce via the API routes.
 */

import type {
  BankConfig,
  DepositProduct,
  Disclosure,
} from "./salesforce/types"

export const MOCK_BANK_CONFIG: BankConfig = {
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

export const MOCK_PRODUCTS: DepositProduct[] = [
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

export const MOCK_DISCLOSURES: Disclosure[] = [
  {
    id: "disc_esign",
    title: "Electronic Signature & Consent Agreement",
    description:
      "By consenting, you agree to receive all account-related documents electronically.",
    pdfUrl: "#",
    required: true,
    sortOrder: 1,
    scope: "bank",
  },
  {
    id: "disc_privacy",
    title: "Privacy Policy",
    description:
      "Learn how we collect, use, and protect your personal information.",
    pdfUrl: "#",
    required: true,
    sortOrder: 2,
    scope: "bank",
  },
  {
    id: "disc_patriot",
    title: "USA PATRIOT Act Notice",
    description:
      "Federal law requires all financial institutions to verify the identity of each person opening an account.",
    pdfUrl: "#",
    required: true,
    sortOrder: 3,
    scope: "bank",
  },
  {
    id: "disc_account_agreement",
    title: "Deposit Account Agreement",
    description:
      "Terms and conditions governing your deposit account including fees, interest rates, and account policies.",
    pdfUrl: "#",
    required: true,
    sortOrder: 4,
    scope: "product",
  },
  {
    id: "disc_fee_schedule",
    title: "Fee Schedule",
    description:
      "Complete schedule of fees associated with your account type.",
    pdfUrl: "#",
    required: true,
    sortOrder: 5,
    scope: "product",
  },
  {
    id: "disc_funds_availability",
    title: "Funds Availability Policy",
    description:
      "Information about when deposited funds will be available for withdrawal.",
    pdfUrl: "#",
    required: false,
    sortOrder: 6,
    scope: "bank",
  },
]
