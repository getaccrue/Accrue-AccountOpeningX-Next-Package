import { NextResponse } from "next/server"
import { getAuthorizationUrl } from "@/lib/salesforce/auth"

export async function GET(request: Request) {
  try {
    // Use SALESFORCE_CALLBACK_URL env var if set, otherwise derive from request
    const { origin } = new URL(request.url)
    const redirectUri =
      process.env.SALESFORCE_CALLBACK_URL ||
      `${origin}/api/salesforce/oauth/callback`
    const authUrl = getAuthorizationUrl(redirectUri)

    // Return a clickable HTML page instead of a redirect so it works
    // inside iframes (like v0 preview) that block external navigations.
    const html = `<!DOCTYPE html>
<html>
<head><title>Connect to Salesforce</title></head>
<body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8f9fa">
  <div style="text-align:center;max-width:500px;padding:2rem">
    <h1 style="margin-bottom:1rem;color:#1a1a2e">Connect to Salesforce</h1>
    <p style="color:#555;margin-bottom:2rem">Click the button below to log in to Salesforce and authorize this application.</p>
    <a href="${authUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 32px;background:#0070f3;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px">
      Log in to Salesforce
    </a>
    <p style="margin-top:2rem;font-size:13px;color:#888">This will open Salesforce login in a new tab.</p>
    <details style="margin-top:1.5rem;text-align:left">
      <summary style="cursor:pointer;color:#0070f3;font-size:14px">Or copy the URL manually</summary>
      <input type="text" value="${authUrl}" readonly onclick="this.select()" style="width:100%;margin-top:8px;padding:8px;font-size:12px;border:1px solid #ddd;border-radius:4px;word-break:break-all" />
    </details>
  </div>
</body>
</html>`

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    })
  } catch (error) {
    console.error("OAuth login error:", error)
    return NextResponse.json(
      { error: "Failed to initiate Salesforce login" },
      { status: 500 }
    )
  }
}
