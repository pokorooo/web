// app/api/env/route.ts - Debug endpoint to verify env variables are loaded
import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const site = process.env.NEXT_PUBLIC_SITE_ORIGIN || ''
  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: !!url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!key,
    NEXT_PUBLIC_BASE_PATH: base,
    NEXT_PUBLIC_SITE_ORIGIN: site,
    urlPreview: url?.slice(0, 24) ?? null,
    keyPreview: key ? `${key.slice(0, 6)}...${key.slice(-4)}` : null
  })
}
