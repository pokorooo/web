"use client"
import { useEffect } from 'react'

export default function AuthHashCatcher() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash || ''
    const search = window.location.search || ''
    const hasTokens = /access_token=|refresh_token=/.test(hash)
    const hasCode = new URLSearchParams(search).get('code')
    if (hasTokens || hasCode) {
      const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://www.pokoro.tech'
      const q = search
      const h = hash
      window.location.replace(`${origin}${base}/auth/confirm${q}${h}`)
    }
  }, [])
  return null
}
