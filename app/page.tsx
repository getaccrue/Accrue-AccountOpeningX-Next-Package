import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Clock, Landmark, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 px-4 pb-16 pt-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span>FDIC Insured up to $250,000</span>
        </div>
        <h1 className="max-w-2xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Open Your New Account in Minutes
        </h1>
        <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Apply for a checking, savings, money market, or CD account
          securely online. No branch visit required.
        </p>
        <Link href="/apply">
          <Button size="lg" className="mt-2 gap-2 px-8 text-base">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="border-t bg-card px-4 py-16">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Quick Application
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Complete your application in under 10 minutes with our
              streamlined process.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Secure Verification
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Bank-grade identity verification powered by Plaid keeps your
              information safe.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Landmark className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Instant Funding
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Link your existing bank account and fund your new account
              immediately.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground">
            How It Works
          </h2>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                step: "1",
                title: "Choose a Product",
                desc: "Select the account type that fits your needs.",
              },
              {
                step: "2",
                title: "Provide Your Info",
                desc: "Enter your personal details and verify your identity.",
              },
              {
                step: "3",
                title: "Review Disclosures",
                desc: "Read and agree to the account terms and disclosures.",
              },
              {
                step: "4",
                title: "Fund & Submit",
                desc: "Link your bank account, fund your new account, and you're done.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
