// app/api/salesforce/oauth/callback/route.ts
import { NextResponse } from "next/server"
import { exchangeCodeForTokens } from "@/lib/salesforce/auth"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const error = url.searchParams.get("error")
  const errorDescription = url.searchParams.get("error_description")

  if (error) {
    return NextResponse.redirect(
      `${url.origin}/?sf_error=${encodeURIComponent(errorDescription || error)}`
    )
  }

  if (!code) {
    return NextResponse.redirect(
      `${url.origin}/?sf_error=${encodeURIComponent("No authorization code received")}`
    )
  }

  try {
    const redirectUri =
      process.env.SALESFORCE_CALLBACK_URL ||
      `${url.origin}/api/salesforce/oauth/callback`

    const result = await exchangeCodeForTokens(code, redirectUri)

    const res = NextResponse.redirect(`${url.origin}/?sf_connected=true`)

    res.cookies.set("sf_access_token", result.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 2,
    })

    res.cookies.set("sf_refresh_token", result.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })

    res.cookies.set("sf_instance_url", result.instanceUrl, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })

    return res
  } catch (err) {
    const message = err instanceof Error ? err.message : "Token exchange failed"
    return NextResponse.redirect(
      `${url.origin}/?sf_error=${encodeURIComponent(message)}`
    )
  }
}
