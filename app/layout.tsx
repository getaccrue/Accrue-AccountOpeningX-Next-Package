import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { BankHeader } from "@/components/branding/bank-header"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Open Your Account",
  description:
    "Apply for a new deposit account securely online. Quick, easy, and FDIC insured.",
}

export const viewport: Viewport = {
  themeColor: "#0F4C81",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          <BankHeader />
          <main className="flex-1">{children}</main>
          <Toaster position="top-right" richColors />
          <footer className="border-t bg-card py-6">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground">
              <p>
                {"Deposits are FDIC insured up to $250,000 per depositor."}
              </p>
              <p>{"Equal Housing Lender. NMLS #000000"}</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
