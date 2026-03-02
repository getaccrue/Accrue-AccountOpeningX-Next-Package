import { z } from "zod"

export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be 50 characters or less"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[\d\s\-()+ ]+$/, "Please enter a valid phone number"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date (YYYY-MM-DD)"),
  ssn: z
    .string()
    .min(1, "SSN is required")
    .regex(/^\d{3}-?\d{2}-?\d{4}$/, "Please enter a valid SSN (XXX-XX-XXXX)"),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    unit: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(2, "State is required").max(2, "Use 2-letter state code"),
    zipCode: z
      .string()
      .regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code"),
  }),
})

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>
