"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApplication } from "@/lib/application-context"
import { PersonalInfoForm } from "@/components/application/personal-info-form"
import type { PersonalInfoFormData } from "@/lib/schemas/personal-info"

export default function PersonalInfoPage() {
  const router = useRouter()
  const {
    setCurrentStep,
    setPersonalInfo,
    personalInfo,
  } = useApplication()

  useEffect(() => {
    setCurrentStep("personal")
  }, [setCurrentStep])

  const handleSubmit = (data: PersonalInfoFormData) => {
    setPersonalInfo({
      ...data,
      address: {
        ...data.address,
        unit: data.address.unit || undefined,
      },
    })
    router.push("/apply/kyc")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Personal Information
        </h1>
        <p className="mt-1 text-muted-foreground">
          Please provide your personal details. This information is required
          for identity verification and account opening.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <PersonalInfoForm
          onSubmit={handleSubmit}
          onBack={() => router.push("/apply")}
          isSubmitting={false}
          defaultValues={
            personalInfo
              ? {
                  ...personalInfo,
                  ssn: "",
                }
              : undefined
          }
        />
      </div>
    </div>
  )
}
