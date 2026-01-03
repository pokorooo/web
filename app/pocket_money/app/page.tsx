// app/page.tsx - Redirect root to /login (basePath is auto-applied)
import { redirect } from 'next/navigation'

export default function Home() {
  // With Next.js basePath, redirect('/login') becomes '/<basePath>/login'
  redirect('/login')
}
