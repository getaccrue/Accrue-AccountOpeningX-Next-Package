import { z } from "zod"

export const fundingSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Please enter a valid amount" })
    .positive("Amount must be greater than $0")
    .max(100000, "Maximum initial deposit is $100,000"),
  publicToken: z.string().optional(),
  accountId: z.string().optional(),
})

export type FundingFormData = z.infer<typeof fundingSchema>
