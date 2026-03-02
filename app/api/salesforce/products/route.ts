import { NextResponse } from "next/server"
import { fetchProducts } from "@/lib/config"

export async function GET() {
  try {
    const products = await fetchProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}
