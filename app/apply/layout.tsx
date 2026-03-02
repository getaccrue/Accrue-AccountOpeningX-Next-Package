import { ApplicationProvider } from "@/lib/application-context"
import { Stepper } from "@/components/application/stepper"

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ApplicationProvider>
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <Stepper />
        <div className="mt-8">{children}</div>
      </div>
    </ApplicationProvider>
  )
}
