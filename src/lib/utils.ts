import { NextRequest, NextResponse } from "next/server";

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function checkApiKey(req: NextRequest): boolean {
  const key = req.headers.get("x-api-key");
  return key === process.env.ZMIND_API_KEY;
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}
