// Salesforce object types matching the managed package schema

export interface BankConfig {
  bankName: string
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  accentColor?: string
  kycConfig: KycConfig
}

export interface KycConfig {
  idvTemplateName: string
  requiredSteps: IdvStep[]
}

export type IdvStep =
  | "accept_tos"
  | "verify_sms"
  | "kyc_check"
  | "documentary_verification"
  | "selfie_check"
  | "risk_check"

export interface DepositProduct {
  id: string
  name: string
  type: "checking" | "savings" | "money_market" | "cd"
  description: string
  interestRate: number
  minOpeningDeposit: number
  features: string[]
  termMonths?: number // For CDs
  active: boolean
}

export interface Disclosure {
  id: string
  title: string
  description: string
  pdfUrl: string // AWS S3 URL
  required: boolean
  sortOrder: number
  scope: "product" | "bank"
}

export interface DisclosureAttestation {
  disclosureId: string
  title: string
  attestedAt: string // ISO 8601 timestamp
  pdfUrl: string
}

export interface AccountApplication {
  id: string
  status: ApplicationStatus
  selectedProductId: string
  personalInfo?: PersonalInfo
  kycStatus?: KycStatus
  kycVerificationId?: string
  disclosureAttestations?: DisclosureAttestation[]
  fundingStatus?: FundingStatus
  fundingTransferId?: string
  fundingAmount?: number
  linkedAccountMask?: string
  linkedInstitutionName?: string
  createdAt: string
  updatedAt: string
}

export type ApplicationStatus =
  | "started"
  | "personal_info_completed"
  | "kyc_completed"
  | "kyc_failed"
  | "disclosures_attested"
  | "funding_completed"
  | "submitted"
  | "approved"
  | "rejected"

export type KycStatus = "pending" | "passed" | "failed" | "review"
export type FundingStatus = "pending" | "authorized" | "completed" | "failed" | "skipped"

export interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  ssn: string // Will be masked in responses
  address: {
    street: string
    unit?: string
    city: string
    state: string
    zipCode: string
  }
}

// SF API response wrappers
export interface SalesforceTokenResponse {
  access_token: string
  refresh_token?: string
  instance_url: string
  token_type: string
  issued_at: string
  id?: string
  scope?: string
}
