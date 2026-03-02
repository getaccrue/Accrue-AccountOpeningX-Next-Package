"use client"

import {
  CreditCard,
  User,
  ShieldCheck,
  FileText,
  Landmark,
  CheckCircle2,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import type {
  DepositProduct,
  PersonalInfo,
  KycStatus,
  DisclosureAttestation,
} from "@/lib/salesforce/types"

interface ReviewSummaryProps {
  product: DepositProduct | null
  personalInfo: PersonalInfo | null
  kycStatus: KycStatus | null
  disclosureAttestations: DisclosureAttestation[]
  fundingAmount: number | null
  linkedAccountMask: string | null
  linkedInstitutionName: string | null
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode
  title: string
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
    </div>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  )
}

export function ReviewSummary({
  product,
  personalInfo,
  kycStatus,
  disclosureAttestations,
  fundingAmount,
  linkedAccountMask,
  linkedInstitutionName,
}: ReviewSummaryProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Product */}
      <div className="flex flex-col gap-3">
        <SectionHeader
          icon={<CreditCard className="h-4 w-4 text-primary" />}
          title="Account"
        />
        <div className="rounded-lg border bg-card p-4">
          <DataRow label="Product" value={product?.name ?? "N/A"} />
          <DataRow
            label="Type"
            value={product ? product.type.charAt(0).toUpperCase() + product.type.slice(1) : "N/A"}
          />
          <DataRow label="Interest Rate" value={product ? `${product.interestRate}% APY` : "N/A"} />
          {product?.termMonths && (
            <DataRow label="Term" value={`${product.termMonths} months`} />
          )}
        </div>
      </div>

      <Separator />

      {/* Personal Info */}
      <div className="flex flex-col gap-3">
        <SectionHeader
          icon={<User className="h-4 w-4 text-primary" />}
          title="Personal Information"
        />
        <div className="rounded-lg border bg-card p-4">
          <DataRow
            label="Name"
            value={personalInfo ? `${personalInfo.firstName} ${personalInfo.lastName}` : "N/A"}
          />
          <DataRow label="Email" value={personalInfo?.email ?? "N/A"} />
          <DataRow label="Phone" value={personalInfo?.phone ?? "N/A"} />
          <DataRow label="Date of Birth" value={personalInfo?.dateOfBirth ?? "N/A"} />
          <DataRow label="SSN" value="***-**-****" />
          <DataRow
            label="Address"
            value={personalInfo ? `${personalInfo.address.street}${
              personalInfo.address.unit ? `, ${personalInfo.address.unit}` : ""
            }, ${personalInfo.address.city}, ${personalInfo.address.state} ${
              personalInfo.address.zipCode
            }` : "N/A"}
          />
        </div>
      </div>

      <Separator />

      {/* KYC */}
      <div className="flex flex-col gap-3">
        <SectionHeader
          icon={<ShieldCheck className="h-4 w-4 text-primary" />}
          title="Identity Verification"
        />
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className={`h-4 w-4 ${
                kycStatus === "passed" ? "text-success" : "text-warning"
              }`}
            />
            <span className="text-sm font-medium text-foreground">
              {kycStatus === "passed"
                ? "Identity Verified"
                : kycStatus === "review"
                  ? "Under Review"
                  : "Verification Status: " + kycStatus}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Disclosures */}
      <div className="flex flex-col gap-3">
        <SectionHeader
          icon={<FileText className="h-4 w-4 text-primary" />}
          title="Disclosures Acknowledged"
        />
        <div className="rounded-lg border bg-card p-4">
          <div className="flex flex-col gap-2">
            {disclosureAttestations.map((att) => (
              <div
                key={att.disclosureId}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                <span className="text-sm text-foreground">{att.title}</span>
                <span className="text-xs text-muted-foreground">
                  ({new Date(att.attestedAt).toLocaleDateString()})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Funding */}
      <div className="flex flex-col gap-3">
        <SectionHeader
          icon={<Landmark className="h-4 w-4 text-primary" />}
          title="Initial Deposit"
        />
        <div className="rounded-lg border bg-card p-4">
          <DataRow
            label="Amount"
            value={fundingAmount ? `$${fundingAmount.toFixed(2)}` : "N/A"}
          />
          <DataRow
            label="From"
            value={linkedInstitutionName ? `${linkedInstitutionName} (****${linkedAccountMask})` : "N/A"}
          />
          <DataRow label="Method" value="ACH Transfer" />
          <DataRow label="Estimated Arrival" value="2-3 Business Days" />
        </div>
      </div>
    </div>
  )
}
