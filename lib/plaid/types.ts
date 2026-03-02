export interface PlaidLinkTokenResponse {
  linkToken: string
  expiration: string
}

export interface PlaidExchangeResponse {
  accessToken: string
  accountId: string
  institutionName: string
  accountMask: string
  accountType: string
}

export interface PlaidTransferAuthorizationResponse {
  authorizationId: string
  decision: "approved" | "declined" | "user_action_required"
  decisionRationale?: {
    code: string
    description: string
  }
}

export interface PlaidTransferResponse {
  transferId: string
  amount: string
  status: string
  created: string
}

export interface PlaidIdvResult {
  status: "success" | "failed" | "expired" | "canceled" | "pending_review"
  identityVerificationId: string
  steps: {
    acceptTos: string
    verifySms: string
    kycCheck: string
    documentaryVerification: string
    selfieCheck: string
    riskCheck: string
  }
}
