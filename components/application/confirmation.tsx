"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, Download, Phone, Mail } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface ConfirmationProps {
  applicationId: string
  productName: string
  fundingAmount: number
  applicantName: string
}

export function Confirmation({
  applicationId,
  productName,
  fundingAmount,
  applicantName,
}: ConfirmationProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Success icon */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
        <CheckCircle2 className="h-12 w-12 text-success" />
      </div>

      {/* Headline */}
      <div className="max-w-lg text-center">
        <h1 className="text-balance text-3xl font-bold text-foreground">
          Application Submitted
        </h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          Thank you, {applicantName}! Your application for a{" "}
          <span className="font-medium text-foreground">{productName}</span>{" "}
          account has been submitted successfully.
        </p>
      </div>

      {/* Application details card */}
      <div className="w-full max-w-md rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Application Details
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              Reference Number
            </span>
            <span className="font-mono text-sm font-medium text-foreground">
              {applicationId}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-muted-foreground">Account Type</span>
            <span className="text-sm font-medium text-foreground">
              {productName}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              Initial Deposit
            </span>
            <span className="text-sm font-medium text-foreground">
              ${fundingAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="text-sm font-medium text-success">
              Under Review
            </span>
          </div>
        </div>
      </div>

      {/* What happens next */}
      <div className="w-full max-w-md rounded-lg border bg-muted/30 p-6">
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          What Happens Next
        </h3>
        <ol className="flex flex-col gap-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </span>
            <span>
              We will review your application. This typically takes 1-2
              business days.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </span>
            <span>
              You will receive an email confirmation with your account details
              once approved.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              3
            </span>
            <span>
              Your initial deposit of ${fundingAmount.toFixed(2)} will arrive
              in your new account within 2-3 business days.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              4
            </span>
            <span>
              You will receive your debit card and account materials by mail
              within 7-10 business days.
            </span>
          </li>
        </ol>
      </div>

      <Separator className="max-w-md" />

      {/* Actions */}
      <div className="flex flex-col items-center gap-3">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Application Summary
        </Button>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="tel:1-800-555-0000" className="flex items-center gap-1.5 hover:text-foreground">
            <Phone className="h-3.5 w-3.5" />
            1-800-555-0000
          </a>
          <a href="mailto:support@bank.com" className="flex items-center gap-1.5 hover:text-foreground">
            <Mail className="h-3.5 w-3.5" />
            support@bank.com
          </a>
        </div>
      </div>
    </div>
  )
}
