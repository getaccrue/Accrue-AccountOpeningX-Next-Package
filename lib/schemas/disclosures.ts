import { z } from "zod"

export const disclosureAttestationSchema = z.object({
  disclosureId: z.string(),
  title: z.string(),
  attestedAt: z.string(), // ISO 8601
  pdfUrl: z.string().url(),
})

export const disclosureAttestationsSchema = z.object({
  attestations: z
    .array(disclosureAttestationSchema)
    .min(1, "At least one disclosure must be attested"),
})

export type DisclosureAttestationData = z.infer<typeof disclosureAttestationSchema>
export type DisclosureAttestationsFormData = z.infer<typeof disclosureAttestationsSchema>
