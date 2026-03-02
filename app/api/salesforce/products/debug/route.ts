import { NextResponse } from "next/server"
import { getProducts } from "@/lib/salesforce/client"

export async function GET() {
  try {
    const products = await getProducts()
    return NextResponse.json({ ok: true, count: products.length, products })
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message,
      },
      { status: 500 }
    )
  }
}
