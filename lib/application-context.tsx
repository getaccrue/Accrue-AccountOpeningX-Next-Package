"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import type {
  DepositProduct,
  PersonalInfo,
  KycStatus,
  FundingStatus,
  DisclosureAttestation,
} from "./salesforce/types"

export type ApplicationStep =
  | "product"
  | "personal"
  | "kyc"
  | "disclosures"
  | "funding"
  | "review"
  | "complete"

export const STEPS: { key: ApplicationStep; label: string; path: string }[] = [
  { key: "product", label: "Select Product", path: "/apply" },
  { key: "personal", label: "Personal Info", path: "/apply/personal" },
  { key: "kyc", label: "Verify Identity", path: "/apply/kyc" },
  { key: "disclosures", label: "Disclosures", path: "/apply/disclosures" },
  { key: "funding", label: "Fund Account", path: "/apply/funding" },
  { key: "review", label: "Review", path: "/apply/review" },
  { key: "complete", label: "Complete", path: "/apply/complete" },
]

interface ApplicationState {
  applicationId: string | null
  currentStep: ApplicationStep
  selectedProduct: DepositProduct | null
  personalInfo: PersonalInfo | null
  kycStatus: KycStatus | null
  kycVerificationId: string | null
  disclosureAttestations: DisclosureAttestation[]
  fundingStatus: FundingStatus | null
  fundingTransferId: string | null
  fundingAmount: number | null
  linkedAccountMask: string | null
  linkedInstitutionName: string | null
}

interface ApplicationContextValue extends ApplicationState {
  setApplicationId: (id: string) => void
  setCurrentStep: (step: ApplicationStep) => void
  setSelectedProduct: (product: DepositProduct) => void
  setPersonalInfo: (info: PersonalInfo) => void
  setKycResult: (status: KycStatus, verificationId: string) => void
  setDisclosureAttestations: (attestations: DisclosureAttestation[]) => void
  setFundingResult: (
    status: FundingStatus,
    transferId: string,
    amount: number,
    accountMask: string,
    institutionName: string
  ) => void
  getStepIndex: (step: ApplicationStep) => number
  canAccessStep: (step: ApplicationStep) => boolean
}

const ApplicationContext = createContext<ApplicationContextValue | null>(null)

const initialState: ApplicationState = {
  applicationId: null,
  currentStep: "product",
  selectedProduct: null,
  personalInfo: null,
  kycStatus: null,
  kycVerificationId: null,
  disclosureAttestations: [],
  fundingStatus: null,
  fundingTransferId: null,
  fundingAmount: null,
  linkedAccountMask: null,
  linkedInstitutionName: null,
}

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ApplicationState>(initialState)

  const setApplicationId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, applicationId: id }))
  }, [])

  const setCurrentStep = useCallback((step: ApplicationStep) => {
    setState((prev) => ({ ...prev, currentStep: step }))
  }, [])

  const setSelectedProduct = useCallback((product: DepositProduct) => {
    setState((prev) => ({ ...prev, selectedProduct: product }))
  }, [])

  const setPersonalInfo = useCallback((info: PersonalInfo) => {
    setState((prev) => ({ ...prev, personalInfo: info }))
  }, [])

  const setKycResult = useCallback(
    (status: KycStatus, verificationId: string) => {
      setState((prev) => ({
        ...prev,
        kycStatus: status,
        kycVerificationId: verificationId,
      }))
    },
    []
  )

  const setDisclosureAttestations = useCallback(
    (attestations: DisclosureAttestation[]) => {
      setState((prev) => ({ ...prev, disclosureAttestations: attestations }))
    },
    []
  )

  const setFundingResult = useCallback(
    (
      status: FundingStatus,
      transferId: string,
      amount: number,
      accountMask: string,
      institutionName: string
    ) => {
      setState((prev) => ({
        ...prev,
        fundingStatus: status,
        fundingTransferId: transferId,
        fundingAmount: amount,
        linkedAccountMask: accountMask,
        linkedInstitutionName: institutionName,
      }))
    },
    []
  )

  const getStepIndex = useCallback((step: ApplicationStep) => {
    return STEPS.findIndex((s) => s.key === step)
  }, [])

  const canAccessStep = useCallback(
    (step: ApplicationStep) => {
      const stepIndex = STEPS.findIndex((s) => s.key === step)
      const currentIndex = STEPS.findIndex(
        (s) => s.key === state.currentStep
      )
      return stepIndex <= currentIndex + 1
    },
    [state.currentStep]
  )

  return (
    <ApplicationContext.Provider
      value={{
        ...state,
        setApplicationId,
        setCurrentStep,
        setSelectedProduct,
        setPersonalInfo,
        setKycResult,
        setDisclosureAttestations,
        setFundingResult,
        getStepIndex,
        canAccessStep,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  )
}

export function useApplication() {
  const context = useContext(ApplicationContext)
  if (!context) {
    throw new Error("useApplication must be used within an ApplicationProvider")
  }
  return context
}
