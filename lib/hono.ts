import { hc } from "hono/client"

import { AppType } from "@/app/api/[[...route]]/route"

// Always use relative URLs for API requests in the browser to avoid CORS issues
const isBrowser = typeof window !== 'undefined'

// In browser - use relative URL
// In development - always use localhost regardless of env vars
// In production - use NEXT_PUBLIC_APP_URL if set, otherwise default to production URL
const baseUrl = isBrowser 
  ? '' // Empty string means relative to current origin
  : (process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : (process.env.NEXT_PUBLIC_APP_URL || 'https://federal-novo.vercel.app'))

export const client = hc<AppType>(baseUrl)