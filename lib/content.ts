import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'site-content.json')

export interface Content {
  hero: Record<string, unknown>
  doctor: Record<string, unknown>
  locations: unknown[]
  treatments: { dermatology: unknown[]; dental: unknown[] }
  testimonials: unknown[]
  blog: unknown[]
  faq: unknown[]
  cta: Record<string, unknown>
  images: Record<string, any>
}

export function readContent(): Content {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8')
  return JSON.parse(raw) as Content
}

export function writeContent(data: Content): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

// Ensure mongoose models are loaded
import { connectToDatabase } from '@/lib/mongodb'
import { SiteContent } from '@/lib/models'

export async function getMergedContent(): Promise<Content> {
  let content = readContent()
  try {
    await connectToDatabase()
    const dbContent = await SiteContent.findOne({ id: 'main' }).lean()
    if (dbContent) {
      const { _id, id, __v, ...cleanContent } = dbContent as any
      content = { ...content, ...cleanContent }
    }
  } catch (dbErr) {
    console.warn('MongoDB connection failed for content, falling back to JSON', dbErr)
  }
  return content
}

// Admin password - change this to your desired password
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'dentofacial2024'