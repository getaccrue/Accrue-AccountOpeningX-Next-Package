"use client"

import React from "react"
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

function titleCaseMaybe(value: unknown): string {
  const s = typeof value === "string" ? value : ""
  if (!s) return "N/A"
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function safeString(value: unknown, fallback = "N/A"): string {
  return typeof value === "string" && value.trim() ? value : fallback
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
  const fullName =
    personalInfo?.firstName || personalInfo?.lastName
      ? `${safeString(personalInfo?.firstName, "")} ${safeString(
          personalInfo?.lastName,
          ""
        )}`.trim() || "N/A"
      : "N/A"

  const addr = personalInfo?.address
  const addressText = addr
    ? `${safeString(addr.street, "")}${
        addr.unit ? `, ${addr.unit}` : ""
      }, ${safeString(addr.city, "")}, ${safeString(
        addr.state,
        ""
      )} ${safeString(addr.zipCode, "")}`.trim()
    : "N/A"

  const fundingAmountText =
    typeof fundingAmount === "number" ? `$${fundingAmount.toFixed(2)}` : "N/A"

  const fundingFromText =
    linkedInstitutionName && linkedAccountMask
      ? `${linkedInstitutionName} (****${linkedAccountMask})`
      : linkedInstitutionName
        ? linkedInstitutionName
        : "N/A"

  const kycLabel =
    kycStatus === "passed"
      ? "Identity Verified"
      : kycStatus === "review"
        ? "Under Review"
        : kycStatus
          ? `Verification Status: ${kycStatus}`
          : "Verification Status: N/A"

  const kycIconClass =
    kycStatus === "passed" ? "text-success" : "text-warning"

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
          <DataRow label="Type" value={titleCaseMaybe(product?.type)} />
          <DataRow
            label="Interest Rate"
            value={
              product?.interestRate != null
                ? `${product.interestRate}% APY`
                : "N/A"
            }
          />
          {product?.termMonths != null && product.termMonths !== 0 && (
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
          <DataRow label="Name" value={fullName} />
          <DataRow label="Email" value={safeString(personalInfo?.email)} />
          <DataRow label="Phone" value={safeString(personalInfo?.phone)} />
          <DataRow
            label="Date of Birth"
            value={safeString(personalInfo?.dateOfBirth)}
          />
          <DataRow label="SSN" value="***-**-****" />
          <DataRow label="Address" value={addressText} />
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
            <CheckCircle2 className={`h-4 w-4 ${kycIconClass}`} />
            <span className="text-sm font-medium text-foreground">
              {kycLabel}
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
            {disclosureAttestations.length === 0 ? (
              <span className="text-sm text-muted-foreground">None</span>
            ) : (
              disclosureAttestations.map((att) => (
                <div key={att.disclosureId} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span className="text-sm text-foreground">
                    {safeString(att.title, "Disclosure")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({new Date(att.attestedAt).toLocaleDateString()})
                  </span>
                </div>
              ))
            )}
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
          <DataRow label="Amount" value={fundingAmountText} />
          <DataRow label="From" value={fundingFromText} />
          <DataRow label="Method" value="ACH Transfer" />
          <DataRow label="Estimated Arrival" value="2-3 Business Days" />
        </div>
      </div>
    </div>
  )
}