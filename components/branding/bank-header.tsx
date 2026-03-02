"use client"

import { Shield } from "lucide-react"
import { MOCK_BANK_CONFIG } from "@/lib/mock-data"

export function BankHeader() {
  const config = MOCK_BANK_CONFIG
  const bankName = config.bankName

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">
            {bankName}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Secure Application</span>
        </div>
      </div>
    </header>
  )
}
